import { createContext, ReactNode, useState } from "react";

import brandsAcmePrimitivesColor from "../../../tokens/brands/acme/primitives/color.json";
import brandsAcmeSemanticColor from "../../../tokens/brands/acme/semantic/color.json";
import brandsGlobexPrimitivesColor from "../../../tokens/brands/globex/primitives/color.json";
import brandsGlobexSemanticColor from "../../../tokens/brands/globex/semantic/color.json";
import {
  flattenTokens,
  FlatToken,
  setLeafValue,
  TokenGroup,
  TokenType,
} from "../utils/flatten";
import globalPrimitivesBorder from "../../../tokens/global/primitives/border.json";
import globalPrimitivesColor from "../../../tokens/global/primitives/color.json";
import globalPrimitivesCubicBezier from "../../../tokens/global/primitives/cubicBezier.json";
import globalPrimitivesDimension from "../../../tokens/global/primitives/dimension.json";
import globalPrimitivesDuration from "../../../tokens/global/primitives/duration.json";
import globalPrimitivesFontFamilyNative from "../../../tokens/global/primitives/fontFamily.native.json";
import globalPrimitivesFontFamilyWeb from "../../../tokens/global/primitives/fontFamily.web.json";
import globalPrimitivesStrokeStyle from "../../../tokens/global/primitives/strokeStyle.json";
import globalPrimitivesTypography from "../../../tokens/global/primitives/typography.json";
import globalSemanticBorder from "../../../tokens/global/semantic/border.json";
import globalSemanticColorDark from "../../../tokens/global/semantic/color.dark.json";
import globalSemanticColorLight from "../../../tokens/global/semantic/color.light.json";
import globalSemanticGradient from "../../../tokens/global/semantic/gradient.json";
import globalSemanticShadow from "../../../tokens/global/semantic/shadow.json";
import globalSemanticTransition from "../../../tokens/global/semantic/transition.json";
import globalSemanticTypography from "../../../tokens/global/semantic/typography.json";
import { Brand, resolveTokens, Theme } from "../utils/resolve";

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
  const [registry, setRegistry] = useState<Record<string, TokenGroup>>({
    "global/primitives/color.json": globalPrimitivesColor,
    "global/semantic/color.light.json": globalSemanticColorLight,
    "global/semantic/color.dark.json": globalSemanticColorDark,
    "brands/acme/primitives/color.json": brandsAcmePrimitivesColor,
    "brands/acme/semantic/color.json": brandsAcmeSemanticColor,
    "brands/globex/primitives/color.json": brandsGlobexPrimitivesColor,
    "brands/globex/semantic/color.json": brandsGlobexSemanticColor,
    "global/primitives/typography.json": globalPrimitivesTypography,
    "global/semantic/typography.json": globalSemanticTypography,
    "global/primitives/fontFamily.web.json": globalPrimitivesFontFamilyWeb,
    "global/primitives/fontFamily.native.json":
      globalPrimitivesFontFamilyNative,
    "global/primitives/border.json": globalPrimitivesBorder,
    "global/semantic/border.json": globalSemanticBorder,
    "global/primitives/strokeStyle.json": globalPrimitivesStrokeStyle,
    "global/primitives/dimension.json": globalPrimitivesDimension,
    "global/primitives/duration.json": globalPrimitivesDuration,
    "global/primitives/cubicBezier.json": globalPrimitivesCubicBezier,
    "global/semantic/transition.json": globalSemanticTransition,
    "global/semantic/shadow.json": globalSemanticShadow,
    "global/semantic/gradient.json": globalSemanticGradient,
  });
  const [theme, setTheme] = useState<Theme>("light");
  const [brand, setBrand] = useState<Brand>("acme");
  const [activeType, setActiveType] = useState<TokenType>("color");

  // Resolved for the active theme x brand only, on every render — not the
  // full brand x theme cross product.
  const { tokens: combinedTokens, sources: tokenSources } = resolveTokens(
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

    setRegistry((prev) => ({
      ...prev,
      [sourceFile]: setLeafValue(prev[sourceFile], path.split("."), value),
    }));
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
