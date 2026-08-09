import { flattenTokens, mergeTokenTrees, TokenGroup } from "./flatten";
import resolverDocJson from "./resolver.json";

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

export function resolveTokens(
  input: Record<string, string> = {},
  registry: Record<string, TokenGroup>,
): TokenGroup {
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

// For a given theme x brand context, which registry entry (e.g.
// "brands/acme/primitives/color.json") actually won each leaf's value.
// Mirrors resolveTokens' merge order exactly — later entries in
// resolutionOrder overwrite earlier ones for the same path — so editing a
// token can look up exactly which registry entry to mutate, rather than
// only knowing its position in the already-merged tree.
export function resolveTokenSources(
  input: Record<string, string> = {},
  registry: Record<string, TokenGroup>,
): Record<string, string> {
  const sources: Record<string, string> = {};

  for (const entry of resolverDoc.resolutionOrder) {
    for (const { $ref } of sourcesFor(entry.$ref, input)) {
      const tree = registry[$ref];
      if (!tree) {
        throw new Error(`No registered token file for $ref: "${$ref}"`);
      }
      for (const { path } of flattenTokens(tree)) {
        sources[path.join(".")] = $ref;
      }
    }
  }

  return sources;
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
export function resolveAllPermutations(
  registry: Record<string, TokenGroup>,
): Record<Brand, Record<Theme, TokenGroup>> {
  return Object.fromEntries(
    BRANDS.map((brand) => [
      brand,
      Object.fromEntries(
        THEMES.map((theme) => [
          theme,
          resolveTokens({ theme, brand }, registry),
        ]),
      ),
    ]),
  ) as Record<Brand, Record<Theme, TokenGroup>>;
}
