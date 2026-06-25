import { arrayMove } from "@dnd-kit/sortable";

export function reorderIds(
  ids: readonly string[],
  activeId: string,
  overId: string
) {
  const activeIndex = ids.indexOf(activeId);
  const overIndex = ids.indexOf(overId);

  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
    return null;
  }

  return arrayMove([...ids], activeIndex, overIndex);
}
