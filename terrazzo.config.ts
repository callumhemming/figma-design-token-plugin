// Builds src/styles/tokens.css from the DTCG tokens (src/tokens/resolver.json).
// Run with `npm run build:tokens`.
import { readFileSync } from "node:fs";
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import { makeCSSVar } from "@terrazzo/token-tools/css";

// Our own $extensions namespace (see the README's "Values DTCG can't
// express"): fluid ranges, and units DTCG dimensions don't allow.
const EXT = "dev.learning-plugin";
const ROOT_FONT_SIZE = 16;

type Dimension = { value: number; unit: string };
type Fluid = { max: unknown; minViewport: unknown; maxViewport: unknown };
type Extension = { fluid?: Fluid; unit?: string };
type Token = {
  id: string;
  $type: string;
  $value: unknown;
  $extensions?: Record<string, unknown>;
  aliasOf?: string;
};

const isRef = (value: unknown): value is string =>
  typeof value === "string" && /^\{.+\}$/.test(value);
const refId = (ref: string) => ref.slice(1, -1);
const round = (n: number) => Number(n.toFixed(4));
const toPx = ({ value, unit }: Dimension) =>
  unit === "rem" ? value * ROOT_FONT_SIZE : value;

// fluid.min/max/viewport values are either a dimension or a {reference}.
function resolveDimension(
  value: unknown,
  tokens: Record<string, Token>,
): Dimension {
  return (isRef(value) ? tokens[refId(value)].$value : value) as Dimension;
}

// clamp() from the min at fluid.minViewport to the max at fluid.maxViewport
// (Utopia's method). Ends that reference another token stay var()s, so
// e.g. p.spacing.fluid.2-4 still points at p.spacing.2 and p.spacing.4.
function fluidClamp(
  token: Token & { originalValue?: unknown },
  fluid: Fluid,
  tokens: Record<string, Token>,
): string {
  const original = (token.originalValue as { $value?: unknown })?.$value;
  const min = token.aliasOf ? `{${token.aliasOf}}` : (original ?? token.$value);

  const minPx = toPx(resolveDimension(min, tokens));
  const maxPx = toPx(resolveDimension(fluid.max, tokens));
  const minVw = toPx(resolveDimension(fluid.minViewport, tokens));
  const maxVw = toPx(resolveDimension(fluid.maxViewport, tokens));

  const slope = (maxPx - minPx) / (maxVw - minVw);
  const intercept = minPx - slope * minVw;
  const bound = (value: unknown) =>
    isRef(value)
      ? makeCSSVar(refId(value), { wrapVar: true })
      : `${round(toPx(value as Dimension) / ROOT_FONT_SIZE)}rem`;

  return `clamp(${bound(min)}, ${round(intercept / ROOT_FONT_SIZE)}rem + ${round(slope * 100)}vw, ${bound(fluid.max)})`;
}

// Token IDs a modifier context's file defines, so its override block holds
// exactly the variables that context changes and nothing else.
function idsIn(file: string): string[] {
  const walk = (node: Record<string, unknown>, path: string[]): string[] =>
    Object.entries(node).flatMap(([key, child]) => {
      if (key.startsWith("$") || typeof child !== "object" || !child) return [];
      const next = [...path, key];
      return "$value" in child
        ? [next.join(".")]
        : walk(child as Record<string, unknown>, next);
    });
  return walk(JSON.parse(readFileSync(`./src/tokens/${file}`, "utf8")), []);
}

export default defineConfig({
  tokens: ["./src/tokens/resolver.json"],
  outDir: "./src/styles/",
  plugins: [
    css({
      filename: "tokens.css",
      legacyHex: true,
      omitTypographyShorthand: true,
      transform(token, { tokensSet }) {
        const ext = token.$extensions?.[EXT] as Extension | undefined;
        const tokens = tokensSet as unknown as Record<string, Token>;
        if (ext?.fluid) {
          return fluidClamp(token as unknown as Token, ext.fluid, tokens);
        }
        if (!ext?.unit || token.aliasOf) {
          return undefined; // Terrazzo's default (aliases become var())
        }
        // em/cap: number tokens hold the multiplier; dimension tokens hold
        // the rem equivalent at the 16px root, output in the real unit.
        const value = token.$value as number | Dimension;
        return `${typeof value === "number" ? value : value.value}${ext.unit}`;
      },
      permutations: [
        {
          input: { theme: "light", brand: "acme", platform: "web" },
          prepare: (contents) => `:root {\n  ${contents}\n}`,
        },
        // Theme only swaps primitive colour scales; semantic and component
        // variables are var()s, so overriding the primitives cascades.
        {
          input: { theme: "dark", brand: "acme", platform: "web" },
          include: idsIn("global/primitives/color.dark.json"),
          prepare: (contents) => `[data-theme="dark"] {\n  ${contents}\n}`,
        },
        // Brand re-points the semantic colour roles.
        {
          input: { theme: "light", brand: "globex", platform: "web" },
          include: idsIn("brands/globex/semantic/color.json"),
          prepare: (contents) => `[data-brand="globex"] {\n  ${contents}\n}`,
        },
      ],
    }),
  ],
});
