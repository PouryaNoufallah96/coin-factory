#!/usr/bin/env bash
set -euo pipefail

COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-coin-factory}"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-/srv/coinfactory/.env}"
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
cleanup() {
  rm -f "$BUILD_ENV_FILE"
}
trap cleanup EXIT

chmod 600 "$BUILD_ENV_FILE"
cp "$DEPLOY_ENV_FILE" "$BUILD_ENV_FILE"

export APP_DATABASE_URL
export APP_S3_ENDPOINT
export COINFACTORY_BUILD_ENV_FILE="$BUILD_ENV_FILE"
export COMPOSE_PROJECT_NAME
export DEPLOY_ENV_FILE

compose() {
  docker compose --env-file "$DEPLOY_ENV_FILE" --profile app "$@"
}

echo "Stopping existing stack..."
compose down --remove-orphans || true

echo "Starting data services..."
compose up -d postgres minio minio-init

echo "Building migration image..."
compose build migrate

echo "Running database migrations..."
compose run --rm migrate

echo "Building application image..."
compose build app

echo "Starting application..."
compose up -d app

echo "Stack status:"
compose ps

if [[ "$FOLLOW_LOGS" == "1" ]]; then
  echo "Showing application logs. Press Ctrl+C to exit."
  compose logs -f app
else
  compose logs --tail=80 app
fi
