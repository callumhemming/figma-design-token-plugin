import { createContext, ReactNode, useEffect, useState } from "react";

import {
  flattenTokens,
  FlatToken,
  setLeafValue,
  TokenGroup,
  TokenType,
} from "../utils/flatten";
import {
  Brand,
  fetchTokenRegistry,
  resolveTokens,
  ResolverDocument,
  Theme,
} from "../utils/resolve";

// Stands in for the tokens/ folder being delivered from a GitHub repo.
// Storybook serves src/tokens/ at this path (see .storybook/main.ts's
// staticDirs) — swap for a real raw.githubusercontent.com URL (and grant it
// in manifest.json's networkAccess.allowedDomains) once tokens actually
// live there. Until then, this is the only loading path: the real Figma
// plugin build (ui.tsx) has no server to fetch this from, so it won't
// resolve tokens outside Storybook.
const TOKENS_BASE_URL = "/tokens";

type TokensContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  brand: Brand;
  setBrand: (brand: Brand) => void;
  activeType: TokenType;
  setActiveType: (type: TokenType) => void;
  combinedTokens: TokenGroup;
  tokens: FlatToken[];
  // Dot-path (matching FlatToken.path.join(".")) -> which registry entry
  // ($ref, e.g. "brands/acme/primitives/color.json") currently defines that
  // leaf for the active theme x brand. Lets an edit target the right source
  // file in `registry` instead of only knowing a path in the merged tree.
  tokenSources: Record<string, string>;
  // path is a dot-path matching FlatToken.path.join(".") / tokenSources'
  // keys. value is committed to the leaf's $value as-is — either a
  // "{other.token.path}" reference string or a literal (e.g. a hex string).
  setTokenValue: (path: string, value: unknown) => void;
};

export const TokensContext = createContext<TokensContextValue | undefined>(
  undefined,
);

export const TokensContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [resolverDoc, setResolverDoc] = useState<ResolverDocument | null>(
    null,
  );
  const [registry, setRegistry] = useState<Record<
    string,
    TokenGroup
  > | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const [theme, setTheme] = useState<Theme>("light");
  const [brand, setBrand] = useState<Brand>("acme");
  const [activeType, setActiveType] = useState<TokenType>("color");

  useEffect(() => {
    let cancelled = false;

    fetchTokenRegistry(TOKENS_BASE_URL)
      .then((result) => {
        if (cancelled) return;
        setResolverDoc(result.resolverDoc);
        setRegistry(result.registry);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return <p>Failed to load tokens: {loadError.message}</p>;
  }

  if (!resolverDoc || !registry) {
    return <p>Loading tokens…</p>;
  }

  // Resolved for the active theme x brand only, on every render — not the
  // full brand x theme cross product.
  const { tokens: combinedTokens, sources: tokenSources } = resolveTokens(
    resolverDoc,
    { theme, brand },
    registry,
  );

  const tokens = flattenTokens(combinedTokens).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  function setTokenValue(path: string, value: unknown) {
    const sourceFile = tokenSources[path];
    if (!sourceFile) {
      throw new Error(`No known source file for token path: "${path}"`);
    }

    setRegistry((prev) => {
      if (!prev) {
        throw new Error("Cannot edit a token before the registry has loaded");
      }
      return {
        ...prev,
        [sourceFile]: setLeafValue(prev[sourceFile], path.split("."), value),
      };
    });
  }

  return (
    <TokensContext.Provider
      value={{
        theme,
        setTheme,
        brand,
        setBrand,
        activeType,
        setActiveType,
        combinedTokens,
        tokens,
        tokenSources,
        setTokenValue,
      }}
    >
      {children}
    </TokensContext.Provider>
  );
};
