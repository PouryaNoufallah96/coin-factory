export function findDbError(
  error: unknown,
  code: string
): { code: string; constraint?: string } | null {
  let current = error;
  const seen = new Set<object>();

  while (isRecord(current) && !seen.has(current)) {
    seen.add(current);

    if (current.code === code) {
      return {
        code,
        constraint:
          typeof current.constraint === "string"
            ? current.constraint
            : undefined,
      };
    }

    current = current.cause;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
