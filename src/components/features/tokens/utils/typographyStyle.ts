import { CSSProperties } from "react";
import { formatResolvedValue } from "./flatten";

export type ResolvedTypographyParts = {
  fontFamily: unknown;
  fontSize: unknown;
  fontWeight: unknown;
  lineHeight: unknown;
  letterSpacing?: unknown;
};

// Builds a live CSSProperties object from a typography composite's already-
// resolved sub-properties (each an already-resolveValue()'d primitive, not
// a {reference} string) -- shared between TypographyTokenChip's preview
// (TokenChip.tsx) and TypographyEdit's live-preview text, so the
// fontFamily-array-join / formatResolvedValue plumbing lives in one place.
// letterSpacing is optional since real typography tokens today don't
// declare one (see COMPOSITE_TOKEN_SHAPES's typography entry).
export function typographyStyleFromResolved(
  parts: ResolvedTypographyParts,
): CSSProperties {
  return {
    fontFamily: Array.isArray(parts.fontFamily)
      ? parts.fontFamily.join(", ")
      : String(parts.fontFamily),
    fontSize: formatResolvedValue(parts.fontSize),
    fontWeight: parts.fontWeight as CSSProperties["fontWeight"],
    lineHeight: parts.lineHeight as CSSProperties["lineHeight"],
    ...(parts.letterSpacing !== undefined
      ? { letterSpacing: formatResolvedValue(parts.letterSpacing) }
      : {}),
  };
}
