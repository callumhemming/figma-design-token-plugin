export type ColorValue = {
  colorSpace: string;
  components: number[];
  alpha?: number;
  hex?: string;
};

export type TokenLeaf = {
  $type: string;
  // Opaque here on purpose — a leaf's $value can be a string, number,
  // array, or composite object depending on $type (color, fontWeight,
  // typography, ...). Only the functions that actually need a specific
  // shape (resolveValue, toCssColor) narrow it.
  $value: unknown;
};

export type TokenGroup = {
  [key: string]: TokenLeaf | TokenGroup;
};

export type FlatToken = {
  path: string[];
  name: string;
  type: string;
  value: unknown;
};

export function isLeaf(node: TokenLeaf | TokenGroup): node is TokenLeaf {
  return typeof (node as TokenLeaf).$value !== "undefined";
}

export function flattenTokens(
  tree: TokenGroup,
  path: string[] = [],
): FlatToken[] {
  return Object.entries(tree).flatMap(([key, node]) => {
    const nextPath = [...path, key];
    if (isLeaf(node)) {
      return [
        {
          path: nextPath,
          name: nextPath.join("-"),
          type: node.$type,
          value: node.$value,
        },
      ];
    }
    return flattenTokens(node, nextPath);
  });
}

export function mergeTokenTrees(...trees: TokenGroup[]): TokenGroup {
  const result: TokenGroup = {};

  for (const tree of trees) {
    for (const [key, node] of Object.entries(tree)) {
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
  if (!isReference(value)) {
    return value; // already a literal value (string, number, composite object, ...)
  }

  const match = value.match(ALIAS_PATTERN)!;

  const node = match[1]
    .split(".")
    .reduce<
      TokenLeaf | TokenGroup | undefined
    >((acc, key) => (acc && !isLeaf(acc) ? acc[key] : undefined), root);

  if (!node || !isLeaf(node)) {
    throw new Error(`Unresolved token reference: ${match[1]}`);
  }

  return resolveValue(node.$value, root); // node.$value may itself be a reference
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
