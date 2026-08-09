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

Tokens live under `src/tokens/` as DTCG token JSON files, wired together by `resolver.json`:

```
src/tokens/
  resolver.json                          # DTCG resolver: sets, modifiers, resolution order
  global/
    primitives/color.json                # base color scale (grey 50–950), literal values
    primitives/typography.json           # font size/weight/line-height scale
    primitives/fontFamily.web.json       # platform modifier: web font stack
    primitives/fontFamily.native.json    # platform modifier: native font stack
    semantic/color.light.json            # theme modifier: light-mode semantic aliases
    semantic/color.dark.json             # theme modifier: dark-mode semantic aliases
    semantic/typography.json             # semantic typography aliases
  brands/
    acme/primitives/color.json           # brand modifier: acme's color primitives
    globex/primitives/color.json         # brand modifier: globex's color primitives
    semantic/color.json                  # brand-agnostic semantic aliases ({color.brand.*})
```

Each token is a leaf shaped like:

```json
{
  "$type": "color",
  "$value": {
    "colorSpace": "hsl",
    "components": [240, 5.9, 90],
    "hex": "#e4e4e7"
  }
}
```

Semantic tokens instead alias a primitive by reference:

```json
{ "$type": "color", "$value": "{color.brand.100}" }
```

`resolver.json` defines how these files combine:

- **sets** — fixed groups of source files always included (e.g. `foundation` = global color primitives).
- **modifiers** — axes with a context per option (`theme`: light/dark, `brand`: acme/globex, `platform`: web/native), each with a default.
- **resolutionOrder** — the order sets and modifiers are merged in; later entries win on key conflicts (`src/tokens/flatten.ts`'s `mergeTokenTrees`).

`src/tokens/resolve.ts` walks `resolutionOrder` for a given `{ theme, brand }` input, resolves each modifier's active context, and merges the resulting trees — plus `resolveAllPermutations()`, which precomputes every theme × brand combination once so the UI can just index into it instead of re-merging on every toggle.

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
