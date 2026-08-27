import { createContext, ReactNode, useEffect, useState } from "react";

import {
  deleteLeafValue,
  flattenTokens,
  FlatToken,
  setLeafNode,
  setLeafValue,
  TokenGroup,
  TokenLeaf,
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
  // Unlike setTokenValue, path doesn't exist yet -- there's no tokenSources
  // entry to look up which file it belongs in, so the caller (who knows
  // what kind of token it's creating) says so directly.
  addToken: (sourceFile: string, path: string, leaf: TokenLeaf) => void;
  removeToken: (path: string) => void;
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

  function addToken(sourceFile: string, path: string, leaf: TokenLeaf) {
    setRegistry((prev) => {
      if (!prev) {
        throw new Error("Cannot add a token before the registry has loaded");
      }
      if (!prev[sourceFile]) {
        throw new Error(`Unknown source file: "${sourceFile}"`);
      }
      return {
        ...prev,
        [sourceFile]: setLeafNode(prev[sourceFile], path.split("."), leaf),
      };
    });
  }

  function removeToken(path: string) {
    const sourceFile = tokenSources[path];
    if (!sourceFile) {
      throw new Error(`No known source file for token path: "${path}"`);
    }

    setRegistry((prev) => {
      if (!prev) {
        throw new Error("Cannot remove a token before the registry has loaded");
      }
      return {
        ...prev,
        [sourceFile]: deleteLeafValue(prev[sourceFile], path.split(".")),
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
        addToken,
        removeToken,
      }}
    >
      {children}
    </TokensContext.Provider>
  );
};
