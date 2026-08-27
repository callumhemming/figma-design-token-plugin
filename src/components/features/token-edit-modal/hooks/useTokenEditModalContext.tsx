import { createContext, useContext } from "react";
import { TokenType } from "../../tokens/utils/flatten";

type TokenEditModalContextValue = {
  tokenTypeFilter: TokenType | null;
  setTokenTypeFilter: (type: TokenType | null) => void;
  // The type of the token currently mid-drag, tracked in React state rather
  // than read off DataTransfer -- the browser only exposes a drag payload's
  // *values* (dataTransfer.getData) at drop time, not during dragover, so a
  // slot can't gate on the dragged type via DataTransfer alone until it's
  // too late to matter. Source and targets share one page/JS realm, so
  // plain state works and sidesteps that restriction entirely.
  draggedTokenType: TokenType | null;
  setDraggedTokenType: (type: TokenType | null) => void;
  // The dragged token's own path, alongside its type -- lets a slot refuse
  // to accept a drop of the exact token already occupying it, which would
  // otherwise write a direct self-reference (path -> {path}) into the
  // registry and send resolveValue into infinite recursion.
  draggedTokenPath: string | null;
  setDraggedTokenPath: (path: string | null) => void;
};

export const TokenEditModalContext =
  createContext<TokenEditModalContextValue | null>(null);

export const useTokenEditModalContext = () => {
  const context = useContext(TokenEditModalContext);
  if (!context)
    throw new Error(
      "useTokenEditModal used outside of TokenEditModal provider",
    );
  return context;
};
