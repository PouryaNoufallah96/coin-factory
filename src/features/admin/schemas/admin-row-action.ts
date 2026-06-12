export type AdminRowActionInput =
  | { ids: string[]; type: "reorder" }
  | { id: string; type: "restore" }
  | { active: boolean; id: string; type: "setActive" }
  | { id: string; type: "softDelete" };
