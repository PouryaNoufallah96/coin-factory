#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-coin-factory}"
# Defaults to the .env sitting next to this script; override with DEPLOY_ENV_FILE.
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-$SCRIPT_DIR/.env}"
FOLLOW_LOGS="${FOLLOW_LOGS:-1}"

if [[ ! -f "$DEPLOY_ENV_FILE" ]]; then
  echo "Missing deploy env file: $DEPLOY_ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$DEPLOY_ENV_FILE"
set +a

APP_DATABASE_URL="${DATABASE_URL:-postgresql://coinfactory:coinfactory@postgres:5432/coinfactory}"
APP_DATABASE_URL="${APP_DATABASE_URL/localhost/postgres}"
APP_DATABASE_URL="${APP_DATABASE_URL/127.0.0.1/postgres}"

APP_S3_ENDPOINT="${S3_ENDPOINT:-http://minio:9000}"
APP_S3_ENDPOINT="${APP_S3_ENDPOINT/localhost/minio}"
APP_S3_ENDPOINT="${APP_S3_ENDPOINT/127.0.0.1/minio}"
APP_S3_ENDPOINT="${APP_S3_ENDPOINT%/}"

BUILD_ENV_FILE="$(mktemp)"

# Zero-downtime-on-failure swap for the `app` service only (same pattern as
# elsewhere in this fleet): build the new image while the live container keeps
# serving, boot it as a throwaway canary joined to the same compose network
# (so it can still resolve postgres/minio by hostname), health-check it, and
# only then swap it into production via a raw `docker run` - never
# `docker compose up`, which identifies "the service's container" by
# project+service *labels* rather than name and can crash trying to recreate
# a BuildKit-built image in place (documented elsewhere in this fleet: hit for
# real on rzprime/backend/rz-admin-panel.api's first deploy, took the site
# down until manually recovered). Data services (postgres/minio) and the
# one-shot migrate step are untouched by any of this - only the swap changed.
LIVE_NAME="coinfactory-app"
CANARY_NAME="${LIVE_NAME}_canary_$$"
CANARY_PORT="13000"
INTERNAL_PORT="3000"
NETWORK="${COMPOSE_PROJECT_NAME}_default"
APP_IMAGE="${APP_IMAGE:-coinfactory-app}"

cleanup() {
  rm -f "$BUILD_ENV_FILE"
  docker rm -f "$CANARY_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

chmod 600 "$BUILD_ENV_FILE"
cp "$DEPLOY_ENV_FILE" "$BUILD_ENV_FILE"

export APP_DATABASE_URL
export APP_S3_ENDPOINT
export COINFACTORY_BUILD_ENV_FILE="$BUILD_ENV_FILE"
export COMPOSE_PROJECT_NAME
export DEPLOY_ENV_FILE
export APP_IMAGE

compose() {
  docker compose --env-file "$DEPLOY_ENV_FILE" --profile app "$@"
}

# Data lives in named volumes (coinfactory-pgdata, coinfactory-minio-data). This
# script NEVER passes `-v`/`--volumes` to compose, so the database and object
# storage are preserved across every redeploy. We also no longer tear the whole
# stack down: data services keep running and only the app is rebuilt/recreated.
pgdata_volume="${COMPOSE_PROJECT_NAME}_coinfactory-pgdata"
if docker volume inspect "$pgdata_volume" >/dev/null 2>&1; then
  echo "Existing deployment detected — preserving database and object storage."
else
  echo "First deployment — initialising database and object storage."
fi

echo "Ensuring data services are up (app itself keeps serving)..."
compose up -d --remove-orphans postgres minio minio-init

echo "Building migration image..."
compose build migrate

echo "Applying pending database migrations (additive; existing data untouched)..."
compose run --rm migrate

echo "Building new application image (production container keeps serving)..."
compose build app

echo "Starting canary on 127.0.0.1:${CANARY_PORT} for a health check..."
docker rm -f "$CANARY_NAME" >/dev/null 2>&1 || true
docker run -d --name "$CANARY_NAME" \
  --network "$NETWORK" \
  -e DATABASE_URL="$APP_DATABASE_URL" \
  -e STORAGE_DRIVER="${STORAGE_DRIVER:-minio}" \
  -e S3_ENDPOINT="$APP_S3_ENDPOINT" \
  -e S3_REGION="${S3_REGION:-us-east-1}" \
  -e S3_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID:-coinfactory}" \
  -e S3_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY:-coinfactory-minio}" \
  -e S3_BUCKET="${S3_BUCKET:-coinfactory-dev}" \
  -e BLOB_READ_WRITE_TOKEN="${BLOB_READ_WRITE_TOKEN:-}" \
  -e RESEND_API_KEY="${RESEND_API_KEY:-}" \
  -e SUBMISSION_NOTIFICATION_EMAIL="${SUBMISSION_NOTIFICATION_EMAIL:-}" \
  -e SUBMISSION_FROM_EMAIL="${SUBMISSION_FROM_EMAIL:-}" \
  -e BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-}" \
  -e BETTER_AUTH_URL="${BETTER_AUTH_URL:-}" \
  -e NEXT_PUBLIC_AUTH_URL="${NEXT_PUBLIC_AUTH_URL:-}" \
  -e ADMIN_EMAIL="${ADMIN_EMAIL:-}" \
  -e ADMIN_PASSWORD="${ADMIN_PASSWORD:-}" \
  -e SENTRY_DSN="${SENTRY_DSN:-}" \
  -e NEXT_PUBLIC_SENTRY_DSN="${NEXT_PUBLIC_SENTRY_DSN:-}" \
  -p "127.0.0.1:${CANARY_PORT}:${INTERNAL_PORT}" \
  "$APP_IMAGE"

echo "Health-checking canary..."
ok=0
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:${CANARY_PORT}" || echo 000)
  echo "  attempt $i: HTTP $code"
  case "$code" in
    200|301|302|307|308) ok=1; break ;;
  esac
  sleep 5
done

if [ "$ok" -ne 1 ]; then
  echo "Canary failed its health check - leaving the production container untouched."
  docker logs --tail 150 "$CANARY_NAME" || true
  exit 1
fi

echo "Canary healthy - swapping into production (brief blip)..."
docker ps -aq --filter "name=^/${LIVE_NAME}\$" | xargs -r docker rm -f >/dev/null 2>&1 || true
docker rm -f "$CANARY_NAME" >/dev/null 2>&1 || true
docker run -d --name "$LIVE_NAME" --restart unless-stopped \
  --network "$NETWORK" \
  -e DATABASE_URL="$APP_DATABASE_URL" \
  -e STORAGE_DRIVER="${STORAGE_DRIVER:-minio}" \
  -e S3_ENDPOINT="$APP_S3_ENDPOINT" \
  -e S3_REGION="${S3_REGION:-us-east-1}" \
  -e S3_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID:-coinfactory}" \
  -e S3_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY:-coinfactory-minio}" \
  -e S3_BUCKET="${S3_BUCKET:-coinfactory-dev}" \
  -e BLOB_READ_WRITE_TOKEN="${BLOB_READ_WRITE_TOKEN:-}" \
  -e RESEND_API_KEY="${RESEND_API_KEY:-}" \
  -e SUBMISSION_NOTIFICATION_EMAIL="${SUBMISSION_NOTIFICATION_EMAIL:-}" \
  -e SUBMISSION_FROM_EMAIL="${SUBMISSION_FROM_EMAIL:-}" \
  -e BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-}" \
  -e BETTER_AUTH_URL="${BETTER_AUTH_URL:-}" \
  -e NEXT_PUBLIC_AUTH_URL="${NEXT_PUBLIC_AUTH_URL:-}" \
  -e ADMIN_EMAIL="${ADMIN_EMAIL:-}" \
  -e ADMIN_PASSWORD="${ADMIN_PASSWORD:-}" \
  -e SENTRY_DSN="${SENTRY_DSN:-}" \
  -e NEXT_PUBLIC_SENTRY_DSN="${NEXT_PUBLIC_SENTRY_DSN:-}" \
  -p "127.0.0.1:${INTERNAL_PORT}:${INTERNAL_PORT}" \
  "$APP_IMAGE"

echo "Stack status:"
compose ps

if [[ "$FOLLOW_LOGS" == "1" ]]; then
  echo "Showing application logs. Press Ctrl+C to exit."
  docker logs -f "$LIVE_NAME"
else
  docker logs --tail=80 "$LIVE_NAME"
fi
