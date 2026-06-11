import "server-only";

// Cache-tag builders consumed by feature tag helpers in
// src/features/<feature>/db/cache/ (rule frontend/cache-components).
// Extend the union as entities land.
export type CacheEntity = "category" | "inquiry" | "question";

export function globalTag(entity: CacheEntity) {
  return `global:${entity}` as const;
}

export function idTag(entity: CacheEntity, id: number | string) {
  return `id:${entity}:${id}` as const;
}
