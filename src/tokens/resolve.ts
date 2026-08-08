import resolverDocJson from "./resolver.json";
import { mergeTokenTrees, TokenGroup } from "./flatten";

import globalPrimitivesColor from "./global/primitives/color.json";
import globalSemanticColorLight from "./global/semantic/color.light.json";
import globalSemanticColorDark from "./global/semantic/color.dark.json";
import brandsAcmePrimitivesColor from "./brands/acme/primitives/color.json";
import brandsGlobexPrimitivesColor from "./brands/globex/primitives/color.json";
import brandsSemanticColor from "./brands/semantic/color.json";
import globalPrimitivesTypography from "./global/primitives/typography.json";
import globalSemanticTypography from "./global/semantic/typography.json";
import globalPrimitivesFontFamilyWeb from "./global/primitives/fontFamily.web.json";
import globalPrimitivesFontFamilyNative from "./global/primitives/fontFamily.native.json";

type SourceRef = { $ref: string };

type SetDef = { sources: SourceRef[] };

type ModifierDef = {
  contexts: Record<string, SourceRef[]>;
  default?: string;
};

type ResolverDocument = {
  version: string;
  sets?: Record<string, SetDef>;
  modifiers?: Record<string, ModifierDef>;
  resolutionOrder: SourceRef[];
};

const resolverDoc: ResolverDocument = resolverDocJson;

// Vite bundles the plugin UI as a single file (Figma's iframe can't fetch
// anything at runtime), so resolver.json's $ref paths can't be read from
// disk — every file it might point at has to already be a static import.
const registry: Record<string, TokenGroup> = {
  "global/primitives/color.json": globalPrimitivesColor,
  "global/semantic/color.light.json": globalSemanticColorLight,
  "global/semantic/color.dark.json": globalSemanticColorDark,
  "brands/acme/primitives/color.json": brandsAcmePrimitivesColor,
  "brands/globex/primitives/color.json": brandsGlobexPrimitivesColor,
  "brands/semantic/color.json": brandsSemanticColor,
  "global/primitives/typography.json": globalPrimitivesTypography,
  "global/semantic/typography.json": globalSemanticTypography,
  "global/primitives/fontFamily.web.json": globalPrimitivesFontFamilyWeb,
  "global/primitives/fontFamily.native.json": globalPrimitivesFontFamilyNative,
};

function sourcesFor(ref: string, input: Record<string, string>): SourceRef[] {
  const [, kind, name] = ref.split("/");

  if (kind === "sets") {
    const set = resolverDoc.sets?.[name];
    if (!set) {
      throw new Error(`Unknown set: "${name}"`);
    }
    return set.sources;
  }

  const modifier = resolverDoc.modifiers?.[name];
  if (!modifier) {
    throw new Error(`Unknown modifier: "${name}"`);
  }

  const context = input[name] ?? modifier.default;
  if (!context) {
    throw new Error(`No context selected for modifier: "${name}"`);
  }

  const sources = modifier.contexts[context];
  if (!sources) {
    throw new Error(`Unknown context "${context}" for modifier "${name}"`);
  }

  return sources;
}

export function resolveTokens(input: Record<string, string> = {}): TokenGroup {
  const trees = resolverDoc.resolutionOrder.flatMap((entry) =>
    sourcesFor(entry.$ref, input).map(({ $ref }) => {
      const tree = registry[$ref];
      if (!tree) {
        throw new Error(`No registered token file for $ref: "${$ref}"`);
      }
      return tree;
    }),
  );

  return mergeTokenTrees(...trees);
}

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const BRANDS = ["acme", "globex"] as const;
export type Brand = (typeof BRANDS)[number];

// One resolveTokens() call per theme x brand combination, done once up
// front rather than on every toggle — cheap given how little JSON this is,
// and it means switching either in the UI is just indexing into this, not
// re-merging. Both axes are independently toggleable, so this is the full
// cross product (2 x 2 today), not two separate single-axis lookups.
export function resolveAllPermutations(): Record<
  Theme,
  Record<Brand, TokenGroup>
> {
  return Object.fromEntries(
    THEMES.map((theme) => [
      theme,
      Object.fromEntries(
        BRANDS.map((brand) => [brand, resolveTokens({ theme, brand })]),
      ),
    ]),
  ) as Record<Theme, Record<Brand, TokenGroup>>;
}
