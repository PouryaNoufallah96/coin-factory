interface IntakeDraft {
  assetDescription?: string | null;
  categoryIds: readonly unknown[];
  files: readonly unknown[];
}

/**
 * The at-least-one gate shared by the landing form and the submit input: an
 * inquiry must carry a description, a supporting document, or a picked
 * category. Pure on purpose — DB-backed checks belong to the handler.
 */
export function hasIntakeSignal(draft: IntakeDraft): boolean {
  return (
    Boolean(draft.assetDescription?.trim()) ||
    draft.files.length > 0 ||
    draft.categoryIds.length > 0
  );
}

export const INTAKE_SIGNAL_MESSAGE =
  "Describe your asset, attach a document, or pick a category to continue.";
