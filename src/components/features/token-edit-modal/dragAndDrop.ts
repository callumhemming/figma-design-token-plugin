import { TokenType } from "../tokens/utils/flatten";

// Custom drag payload MIME type shared between the left-column token chips
// (drag source, TokenEditModal.tsx) and the typography slots (drop target,
// TypographyEdit.tsx) -- a single JSON payload rather than separate
// text/plain + type fields, so path and type can't get out of sync.
export const DRAGGED_TOKEN_MIME_TYPE = "application/x-token";

export type DraggedToken = {
  path: string;
  type: TokenType;
};

export function setDraggedToken(
  dataTransfer: DataTransfer,
  token: DraggedToken,
) {
  dataTransfer.setData(DRAGGED_TOKEN_MIME_TYPE, JSON.stringify(token));
  dataTransfer.effectAllowed = "copy";
}

export function getDraggedToken(
  dataTransfer: DataTransfer,
): DraggedToken | null {
  const raw = dataTransfer.getData(DRAGGED_TOKEN_MIME_TYPE);
  if (!raw) return null;
  return JSON.parse(raw) as DraggedToken;
}
