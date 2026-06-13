import "server-only";

interface RateWindow {
  count: number;
  resetAt: number;
}

// Bound the map before scanning for expired windows so a key-spraying client
// cannot grow it without limit.
const MAX_TRACKED_KEYS = 10_000;

const rateWindows = new Map<string, RateWindow>();

/**
 * Fixed-window in-memory limiter — sufficient for the single-node deploy
 * (ADR-0006); the reverse proxy adds the pre-parse layer in front of it.
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  if (rateWindows.size >= MAX_TRACKED_KEYS) {
    pruneExpired(now);
  }
  const current = rateWindows.get(key);
  if (!current || current.resetAt <= now) {
    rateWindows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

function pruneExpired(now: number): void {
  for (const [key, rateWindow] of rateWindows) {
    if (rateWindow.resetAt <= now) {
      rateWindows.delete(key);
    }
  }
}
