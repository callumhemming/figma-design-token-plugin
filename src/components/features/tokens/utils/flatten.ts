// The DTCG color module's supported interchange color spaces (Section 4.2).
export const COLOR_SPACES = [
  "srgb",
  "srgb-linear",
  "hsl",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "display-p3",
  "a98-rgb",
  "prophoto-rgb",
  "rec2020",
  "xyz-d65",
  "xyz-d50",
] as const;

export type ColorSpace = (typeof COLOR_SPACES)[number];

export type ColorValue = {
  colorSpace: ColorSpace;
  components: number[];
  alpha?: number;
  hex?: string;
};

export type TokenLeaf = {
  // Optional: DTCG lets a group declare `$type` once and have every
  // descendant leaf inherit it instead of repeating it — see `ownType`
  // and the `inheritedType` param on flattenTokens below.
  $type?: string;
  // Opaque here on purpose — a leaf's $value can be a string, number,
  // array, or composite object depending on $type (color, fontWeight,
  // typography, ...). Only the functions that actually need a specific
  // shape (resolveValue, toCssColor) narrow it.
  $value: unknown;
  $description?: string;
  $extensions?: Record<string, unknown>;
  // Like $type, a group's $deprecated cascades to descendants unless a
  // leaf overrides it (DTCG format spec, Section 6.3.1) — see
  // `ownDeprecated` and the `inheritedDeprecated` param below.
  // $description/$extensions don't cascade, so they're read straight off
  // the leaf with no inheritance plumbing.
  $deprecated?: boolean | string;
};

export type TokenGroup = {
  [key: string]: TokenLeaf | TokenGroup;
};

export type FlatToken = {
  path: string[];
  name: string;
  type: TokenType;
  value: unknown;
  description?: string;
  extensions?: Record<string, unknown>;
  deprecated?: boolean | string;
};

// The full DTCG $type taxonomy this repo has token files for — drives the
// sidebar's type nav. Keep in sync with COMPOSITE_TOKEN_SHAPES below and
// with resolver.json's sets: every type here should have at least a
// primitives or semantic source registered somewhere in the resolver.
export const PRIMITIVE_TOKEN_TYPES = [
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "number",
  "duration",
  "cubicBezier",
] as const;

export const COMPOSITE_TOKEN_TYPES = [
  "typography",
  "border",
  "strokeStyle",
  "shadow",
  "gradient",
  "transition",
] as const;

export const TOKEN_TYPES = [
  ...PRIMITIVE_TOKEN_TYPES,
  ...COMPOSITE_TOKEN_TYPES,
] as const;

export type TokenType = (typeof TOKEN_TYPES)[number];

export function isLeaf(node: TokenLeaf | TokenGroup): node is TokenLeaf {
  return typeof (node as TokenLeaf).$value !== "undefined";
}

// Group-level metadata keys (see TokenLeaf above) — these sit as plain
// values alongside a group's child keys, which TokenGroup's index
// signature doesn't model (doing so would force every TokenGroup consumer
// in the app to account for non-TokenLeaf/TokenGroup values), so they're
// read via a narrow, local cast instead, and skipped wherever a group's
// keys are iterated as if they were all children.
const GROUP_METADATA_KEYS = new Set([
  "$type",
  "$deprecated",
  "$description",
  "$extensions",
]);

function ownType(tree: TokenGroup): string | undefined {
  const value = (tree as Record<string, unknown>).$type;
  return typeof value === "string" ? value : undefined;
}

function ownDeprecated(tree: TokenGroup): boolean | string | undefined {
  const value = (tree as Record<string, unknown>).$deprecated;
  return typeof value === "boolean" || typeof value === "string"
    ? value
    : undefined;
}

export function flattenTokens(
  tree: TokenGroup,
  path: string[] = [],
  inheritedType?: string,
  inheritedDeprecated?: boolean | string,
): FlatToken[] {
  const groupType = ownType(tree) ?? inheritedType;
  const groupDeprecated = ownDeprecated(tree) ?? inheritedDeprecated;

  return Object.entries(tree).flatMap(([key, node]) => {
    // Metadata, not a child token/group — skip it rather than let it fall
    // through to isLeaf/recursion below, which would treat this plain
    // value as a node and (for a string) walk its characters as if they
    // were keys.
    if (GROUP_METADATA_KEYS.has(key)) {
      return [];
    }

    const nextPath = [...path, key];
    if (isLeaf(node)) {
      const type = node.$type ?? groupType;
      if (!type) {
        throw new Error(
          `Token at "${nextPath.join(".")}" has no $type, and none was inherited from an ancestor group`,
        );
      }
      return [
        {
          path: nextPath,
          name: nextPath.join("-"),
          type: type as TokenType,
          value: node.$value,
          description: node.$description,
          extensions: node.$extensions,
          deprecated: node.$deprecated ?? groupDeprecated,
        },
      ];
    }
    return flattenTokens(node, nextPath, groupType, groupDeprecated);
  });
}

export type ReferencePath = {
  path: string;
  type: string;
};

// The set of `{...}`-referenceable paths for a single resolved tree (i.e.
// one theme x brand permutation) — used to drive reference autofill. Pass
// `type` to narrow to paths of a single token type, e.g. so a composite
// token's `color` sub-field only offers other `color` tokens as options.
export function referencePaths(
  tree: TokenGroup,
  type?: string,
): ReferencePath[] {
  return flattenTokens(tree)
    .filter((token) => type === undefined || token.type === type)
    .map(({ path, type }) => ({
      path: path.join("."),
      type,
    }));
}

// A composite token's `$value` is an object of named sub-properties (per
// the DTCG spec: typography, border, shadow, transition, strokeStyle, ...),
// each of which may itself be a literal or a `{token.path}` reference.
// This maps each composite $type to its sub-properties and the token $type
// a reference in that sub-property must resolve to — drives which
// referencePaths a per-field picker should offer.
export type CompositeTokenProperty = {
  property: string;
  expectedType: string;
};

export const COMPOSITE_TOKEN_SHAPES: Record<string, CompositeTokenProperty[]> =
  {
    typography: [
      { property: "fontFamily", expectedType: "fontFamily" },
      { property: "fontSize", expectedType: "dimension" },
      { property: "fontWeight", expectedType: "fontWeight" },
      { property: "lineHeight", expectedType: "number" },
    ],
    border: [
      { property: "color", expectedType: "color" },
      { property: "width", expectedType: "dimension" },
      { property: "style", expectedType: "strokeStyle" },
    ],
    shadow: [
      { property: "color", expectedType: "color" },
      { property: "offsetX", expectedType: "dimension" },
      { property: "offsetY", expectedType: "dimension" },
      { property: "blur", expectedType: "dimension" },
      { property: "spread", expectedType: "dimension" },
    ],
    transition: [
      { property: "duration", expectedType: "duration" },
      { property: "delay", expectedType: "duration" },
      { property: "timingFunction", expectedType: "cubicBezier" },
    ],
    // gradient omitted: its $value is an array of { color, position } stops,
    // not a flat object of named sub-properties like the shapes above — this
    // map's "one $type -> named properties" shape doesn't fit it.
  };

// Immutable leaf replacement: returns a new tree with $value at `path`
// swapped for `value`, leaving every other node (including unrelated
// siblings) untouched — a caller doing setRegistry(prev => ...) can safely
// replace just the one registry entry the leaf lives in.
export function setLeafValue(
  tree: TokenGroup,
  path: string[],
  value: unknown,
): TokenGroup {
  const [key, ...rest] = path;
  const node = tree[key];
  if (!node) {
    throw new Error(`No token at path: "${path.join(".")}"`);
  }

  if (rest.length === 0) {
    if (!isLeaf(node)) {
      throw new Error(`Path does not point to a leaf: "${path.join(".")}"`);
    }
    return { ...tree, [key]: { ...node, $value: value } };
  }

  if (isLeaf(node)) {
    throw new Error(`Path does not point to a leaf: "${path.join(".")}"`);
  }

  return { ...tree, [key]: setLeafValue(node, rest, value) };
}

export function mergeTokenTrees(...trees: TokenGroup[]): TokenGroup {
  const result: TokenGroup = {};

  for (const tree of trees) {
    for (const [key, node] of Object.entries(tree)) {
      // Metadata, not a child token/group (see GROUP_METADATA_KEYS above)
      // — always overwrite rather than let it reach the isLeaf checks
      // below, which would (wrongly, since it's a plain value) treat it
      // as mergeable and, for a string, recurse into its characters.
      if (GROUP_METADATA_KEYS.has(key)) {
        result[key] = node;
        continue;
      }

      const existing = result[key];
      if (existing && !isLeaf(existing) && !isLeaf(node)) {
        result[key] = mergeTokenTrees(existing, node); // both groups: recurse
      } else {
        result[key] = node; // leaf, or first time seeing this key: overwrite
      }
    }
  }

  return result;
}

const ALIAS_PATTERN = /^\{(.+)\}$/;

export function isReference(value: unknown): value is string {
  return typeof value === "string" && ALIAS_PATTERN.test(value);
}

export function resolveValue(value: unknown, root: TokenGroup): unknown {
  if (isReference(value)) {
    const match = value.match(ALIAS_PATTERN)!;

    const node = match[1]
      .split(".")
      .reduce<TokenLeaf | TokenGroup | undefined>(
        (acc, key) => (acc && !isLeaf(acc) ? acc[key] : undefined),
        root,
      );

    if (!node || !isLeaf(node)) {
      throw new Error(`Unresolved token reference: ${match[1]}`);
    }

    return resolveValue(node.$value, root); // node.$value may itself be a reference
  }

  // Composite $value (typography, border, shadow, ...): each sub-property
  // can independently be a literal or its own reference, per the DTCG
  // composite token spec — resolve every element/property in place.
  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, root));
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        resolveValue(item, root),
      ]),
    );
  }

  return value; // already a literal value (string, number, ...)
}

// Assumes a color-shaped value (string or ColorValue) — only call this on
// tokens where $type === "color"; other token types aren't color-renderable.
export function toCssColor(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  const color = value as ColorValue;
  if (color.hex) {
    return color.hex;
  }
  const [h, s, l] = color.components;
  return `hsl(${h} ${s}% ${l}% / ${color.alpha ?? 1})`;
}

// Best-effort human-readable rendering of a resolved (non-color) value for
// chip display — not a real per-type renderer (see gradient/cubicBezier
// preview TODOs), just enough to make every $type legible in the token
// list rather than showing raw JSON everywhere.
export function formatResolvedValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    // cubicBezier: [x1, y1, x2, y2]
    if (value.length === 4 && value.every((n) => typeof n === "number")) {
      return `cubic-bezier(${value.join(", ")})`;
    }
    return JSON.stringify(value);
  }

  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // dimension / duration: { value, unit }
    if (
      typeof obj.value === "number" &&
      typeof obj.unit === "string" &&
      Object.keys(obj).length === 2
    ) {
      return `${obj.value}${obj.unit}`;
    }
    return JSON.stringify(value);
  }

  return String(value);
}
