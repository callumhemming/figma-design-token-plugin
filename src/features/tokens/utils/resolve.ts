import { flattenTokens, mergeTokenTrees, TokenGroup } from "./flatten";
import resolverDocJson from "../../../tokens/resolver.json";

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

export type ResolvedTokens = {
  tokens: TokenGroup;
  // Dot-path -> which registry entry (e.g. "brands/acme/primitives/color.json")
  // won that leaf's value. Built in the same merge pass as `tokens`, in
  // resolutionOrder — later entries overwrite earlier ones for the same
  // path — so an edit can look up exactly which registry entry to mutate
  // instead of only knowing a path in the already-merged tree.
  sources: Record<string, string>;
};

// Resolves a single theme x brand context: walks resolutionOrder once,
// merging each source tree into the result and recording which $ref won
// each leaf as it goes.
export function resolveTokens(
  input: Record<string, string> = {},
  registry: Record<string, TokenGroup>,
): ResolvedTokens {
  let tokens: TokenGroup = {};
  const sources: Record<string, string> = {};

  for (const entry of resolverDoc.resolutionOrder) {
    for (const { $ref } of sourcesFor(entry.$ref, input)) {
      const tree = registry[$ref];
      if (!tree) {
        throw new Error(`No registered token file for $ref: "${$ref}"`);
      }
      tokens = mergeTokenTrees(tokens, tree);
      for (const { path } of flattenTokens(tree)) {
        sources[path.join(".")] = $ref;
      }
    }
  }

  return { tokens, sources };
}

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const BRANDS = ["acme", "globex"] as const;
export type Brand = (typeof BRANDS)[number];
