export function moveOrderedId(
  ids: readonly string[],
  id: string,
  delta: -1 | 1
) {
  const index = ids.indexOf(id);
  const nextIndex = index + delta;

  if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) {
    return null;
  }

  const next = [...ids];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];

  return next;
}
