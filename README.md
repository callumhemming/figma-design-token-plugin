# Learning Plugin

A Figma plugin for exploring [DTCG](https://www.designtokens.org/) (Design Tokens Community Group) design tokens: a resolver-driven token pipeline that merges primitive and semantic token files into a single resolved theme, renders them as editable swatches inside Figma, and writes edits back to the in-memory token source.

## What it does

- Loads a set of DTCG-format token JSON files (primitives, semantics, brand overrides) and merges them according to a DTCG [resolver document](https://www.designtokens.org/schemas/2025.10/resolver.json) (`src/tokens/resolver.json`).
- Resolves two independent modifiers — **theme** (`light` / `dark`) and **brand** (`acme` / `globex`) — into a fully-merged token tree, precomputing every theme × brand permutation up front.
- Renders primitive and semantic color tokens as swatches ("token chips") in the plugin UI, resolving `{alias.path}` references to their final CSS color.
- Lets you click a chip to edit its value in place — either type a new hex color or pick another token to alias via a combobox of every referenceable path in the current tree — and commits the edit back to whichever source file actually owns that token.

## Why

Design tokens usually only get consumed one way (token JSON → CSS/build output). This project builds the resolver and merge logic from the spec directly, and pairs it with a small interactive UI, to make the merge order, alias resolution, and brand/theme overrides concrete and inspectable rather than opaque build-step output.

## Token structure

Tokens live under `src/tokens/` as DTCG token JSON files, wired together by `resolver.json`. They mirror `src/styles/design-system.scss` in three layers, each under its own root group so a token's flattened name is its CSS custom property (`p.color.slate.1` → `--p-color-slate-1`):

- **`p` (primitives)**: raw values.
- **`s` (semantic)**: purpose, and only alias primitives.
- **`c` (component)**: per-component settings, and only alias semantic tokens.

```
src/tokens/
  resolver.json                           # DTCG resolver: sets, modifiers, resolution order
  global/
    primitives/color.json                 # theme-independent colours (white, transparent, amber contrast)
    primitives/color.light.json           # theme modifier: Radix light scales (slate, indigo, teal, amber, orange, purple, crimson)
    primitives/color.dark.json            # theme modifier: Radix dark scales, same steps
    primitives/spacing.json               # 4px rem grid, fluid spacing pairs, cap-height multiples
    primitives/viewport.json              # min/max viewport for every fluid token
    primitives/radius.json
    primitives/border-width.json
    primitives/typography.json            # weights, Utopia fluid font sizes, line heights, letter spacing
    primitives/font-family.web.json       # platform modifier: web font stack
    primitives/font-family.native.json    # platform modifier: native font stack
    semantic/color.json                   # neutral (slate) and danger (red) roles, shared by every brand
    semantic/spacing.json
    semantic/radius.json
    semantic/border-width.json
    semantic/typography.json              # one typography composite per variant, plus gutters
    component/button.json
    component/form-input.json             # label/description/error shell
    component/input.json                  # text, number, select, textarea, colour swatch
    component/checkbox.json
  brands/
    acme/semantic/color.json              # brand modifier: primary/secondary/accent → indigo/teal/amber
    globex/semantic/color.json            # brand modifier: primary/secondary/accent → orange/purple/crimson
```

Primitives hold literal values:

```json
{
  "$type": "color",
  "$value": {
    "colorSpace": "srgb",
    "components": [0.2431, 0.3882, 0.8667],
    "hex": "#3e63dd"
  }
}
```

Semantic and component tokens alias the layer below by reference:

```json
{ "$type": "color", "$value": "{p.color.indigo.9}" }
```

Theme swaps only the primitive colour scales. A Radix step does the same job in light and dark, so semantic and component tokens are shared by both. Brand re-points the semantic colour roles at different hues, and component tokens follow automatically.

### Values DTCG can't express

The token files stay valid against the DTCG 2025.10 schemas. Values CSS can express but DTCG can't are stored under `$extensions["dev.learning-plugin"]`:

- **Fluid sizes** (`clamp()` in CSS): `$value` is the minimum, and `fluid.max` holds the maximum. `fluid.minViewport`/`maxViewport` reference `p.viewport.*`. Fluid spacing references spacing steps for both ends (e.g. `p.spacing.fluid.2-4` runs from `{p.spacing.2}` to `{p.spacing.4}`).
- **Relative units**: DTCG dimensions only allow `px`/`rem`, so `unit` records the real unit:
  - Letter spacing is a `rem` dimension holding the value at the 16px root (so typography composites stay valid), with `unit: "em"`.
  - Gutters are `number` tokens holding the multiplier, with `unit: "cap"`.

### Generated CSS

`npm run build:tokens` runs [Terrazzo](https://terrazzo.app) (`tz build`, configured in `terrazzo.config.ts`), which reads `resolver.json` directly and writes `src/styles/tokens.css`. `npm run build` runs it too. The output has:

- **`:root`**: the defaults (light, acme, web).
- **`[data-theme="dark"]`**: only the tokens `color.dark.json` defines.
- **`[data-brand="globex"]`**: only the tokens globex's semantic file defines.

Semantic and component variables are `var()` references to the layer below, so both overrides cascade. The config's `transform` turns the `dev.learning-plugin` extensions back into CSS: fluid tokens become `clamp()`, and `unit` outputs `em`/`cap`. Don't edit `tokens.css` by hand: change the tokens and rebuild.

### Resolution

`resolver.json` defines how these files combine:

- **sets**: groups of source files that are always included (`primitives`, `semantic`, `component`).
- **modifiers**: axes with one context per option (`theme`: light/dark, `platform`: web/native, `brand`: acme/globex), each with a default.
- **resolutionOrder**: the order sets and modifiers are merged in. Later entries win on key conflicts (`mergeTokenTrees` in `src/components/features/tokens/utils/flatten.ts`).

`resolveTokens` in `src/components/features/tokens/utils/resolve.ts` walks `resolutionOrder` for the active `{ theme, brand }`, resolves each modifier's context, and merges the resulting trees.

## Running it

```bash
npm install
npm run build      # typecheck + build the plugin (dist/code.js, dist/ui.html)
npm run watch       # rebuild on save (main + ui, concurrently)
```

Then in Figma: **Plugins → Development → Import plugin from manifest…**, pick this repo's `manifest.json`, and run it from the Plugins menu. Toggle **Theme** and **Brand** in the plugin UI to switch resolved permutations; click a color chip to edit its hex value or re-point it at a different token reference.

Other scripts:

```bash
npm run typecheck        # TS project references, no emit
npm run lint              # eslint
npm run storybook         # component playground at localhost:6006 (TokenChip, App, etc.)
npm run build-storybook   # static storybook build
```

## Known gaps

See [`TODO.md`](TODO.md) for the running list — notably: no schema validation over token files yet (one known-invalid hex, `#fnfnf`, in `brands/acme/primitives/color.json`), typography composite aliases aren't resolved yet, and edits made in the plugin UI aren't synced back to the source JSON files on disk (they only live in the in-memory registry for the session).
