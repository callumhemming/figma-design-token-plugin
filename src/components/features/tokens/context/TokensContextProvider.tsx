import { createContext, ReactNode, useEffect, useState } from "react";

import {
  flattenTokens,
  FlatToken,
  setLeafValue,
  TokenGroup,
} from "../utils/flatten";
import {
  Brand,
  fetchTokenRegistry,
  ResolverDocument,
  resolveTokens,
  Theme,
} from "../utils/resolve";

const TOKENS_BASE_URL = "/tokens";

type TokensContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  brand: Brand;
  setBrand: (brand: Brand) => void;
  combinedTokens: TokenGroup;
  tokens: FlatToken[];

  tokenSources: Record<string, string>;

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
  const [resolverDoc, setResolverDoc] = useState<ResolverDocument | null>(null);
  const [registry, setRegistry] = useState<Record<string, TokenGroup> | null>(
    null,
  );
  const [loadError, setLoadError] = useState<Error | null>(null);

  const [theme, setTheme] = useState<Theme>("light");
  const [brand, setBrand] = useState<Brand>("acme");

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
  // console.log({ combinedTokens });

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
