import { flattenTokens, mergeTokenTrees, TokenGroup } from "./flatten";

export type SourceRef = { $ref: string };

export type SetDef = { sources: SourceRef[] };

export type ModifierDef = {
  contexts: Record<string, SourceRef[]>;
  default?: string;
};

export type ResolverDocument = {
  version: string;
  sets?: Record<string, SetDef>;
  modifiers?: Record<string, ModifierDef>;
  resolutionOrder: SourceRef[];
};

function sourcesFor(
  resolverDoc: ResolverDocument,
  ref: string,
  input: Record<string, string>,
): SourceRef[] {
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
  resolverDoc: ResolverDocument,
  input: Record<string, string> = {},
  registry: Record<string, TokenGroup>,
): ResolvedTokens {
  let tokens: TokenGroup = {};
  const sources: Record<string, string> = {};

  for (const entry of resolverDoc.resolutionOrder) {
    for (const { $ref } of sourcesFor(resolverDoc, entry.$ref, input)) {
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

// Every unique source $ref referenced anywhere in the resolver doc — every
// set and every modifier context — regardless of which theme/brand/platform
// is currently active. Used to know the full list of token files to fetch
// up front, since a fetched registry can't lazily discover files the way a
// bundler's static imports could.
export function collectSourceRefs(resolverDoc: ResolverDocument): string[] {
  const refs = new Set<string>();

  for (const set of Object.values(resolverDoc.sets ?? {})) {
    for (const { $ref } of set.sources) refs.add($ref);
  }
  for (const modifier of Object.values(resolverDoc.modifiers ?? {})) {
    for (const sources of Object.values(modifier.contexts)) {
      for (const { $ref } of sources) refs.add($ref);
    }
  }

  return [...refs];
}

export type TokenRegistrySource = {
  resolverDoc: ResolverDocument;
  registry: Record<string, TokenGroup>;
};

// Stands in for delivering the tokens/ folder from a GitHub repo: fetches
// resolver.json from `baseUrl`, then every source file it references, and
// builds the same registry shape TokensContextProvider used to assemble
// from static imports. `baseUrl` is whatever's currently serving the
// tokens/ tree as static files (Storybook's staticDirs today).
export async function fetchTokenRegistry(
  baseUrl: string,
): Promise<TokenRegistrySource> {
  const resolverRes = await fetch(`${baseUrl}/resolver.json`);
  if (!resolverRes.ok) {
    throw new Error(
      `Failed to fetch resolver.json from "${baseUrl}": ${resolverRes.status}`,
    );
  }
  const resolverDoc: ResolverDocument = await resolverRes.json();

  const refs = collectSourceRefs(resolverDoc);
  const entries = await Promise.all(
    refs.map(async (ref) => {
      const res = await fetch(`${baseUrl}/${ref}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch token source "${ref}": ${res.status}`);
      }
      return [ref, (await res.json()) as TokenGroup] as const;
    }),
  );

  return { resolverDoc, registry: Object.fromEntries(entries) };
}

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const BRANDS = ["acme", "globex"] as const;
export type Brand = (typeof BRANDS)[number];
