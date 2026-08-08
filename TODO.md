# Todo / Ideas

## Tokens

- **Run a schema validator over token files.** We hand-validated `resolver.json` against the DTCG resolver schema with `ajv` (Draft-07, schema at `https://www.designtokens.org/schemas/2025.10/resolver.json`). Do the same for the token files themselves — the resolver schema's `$defs` embed the full `token.json`/`group.json`/`color.json` etc. definitions, so the same schema can validate token file contents too. Would have caught the invalid `#fnfnf` hex automatically instead of by eye. Candidate: an `npm run validate:tokens` script.
- **Fix `brands/acme/primitives/color.json` → `color.brand.300`** — currently `"#fnfnf"`, not a valid hex color (`n` isn't a hex digit). Still unresolved.
- **Globex is a placeholder brand.** Added to demonstrate/test brand-toggling — its palette (`brands/globex/primitives/color.json`, orange/purple/gray) is made up, not real brand colors. Replace or remove once there's an actual second brand.
- **Real dark-mode primitives.** `global/semantic/color.dark.json` currently reuses light-mode primitives (`brand.200`, `grey.500`) as placeholders, flagged via `$description`. Needs its own dark-appropriate primitive palette.
- **`$type` inheritance from parent groups.** Spec allows a token to omit `$type` and inherit it from the nearest parent group that declares one. `flattenTokens`/`isLeaf` don't implement this — harmless today since every leaf sets `$type` explicitly, but would silently produce `type: undefined` if that ever changes.
- **Cycle detection in `resolveValue`.** A circular alias chain (`{a}` → `{b}` → `{a}`) recurses until the stack overflows. No guard in place; not an issue with current data.
- **`resolveValue` can't resolve per-property aliases inside composite `$value`s.** `global/semantic/typography.json`'s `body`/`heading` tokens have aliases nested *inside* the `$value` object (e.g. `$value.fontFamily = "{fontFamily.sans}"`), not the whole `$value` being a single alias string like our color tokens. `isReference`/`resolveValue` only handle the latter — they'd currently return the typography composite unresolved (aliases left as literal `{...}` strings inside it). Needed before typography tokens are actually usable.
- **Confirm the DTCG `typography` composite's real sub-properties.** Used `fontFamily`/`fontSize`/`fontWeight`/`lineHeight` as the obvious set when scaffolding `global/semantic/typography.json`, but didn't get a confirmed exact list from the spec (content was truncated when fetched) — worth double-checking against the Format module before treating this as final.

## Resolver

- ~~Build the actual resolver-consumer.~~ Done — `tokens/resolve.ts`'s `resolveTokens(input)` walks `resolutionOrder`, resolves each modifier's context (input value, or its `default`) via a static file registry, and folds through `mergeTokenTrees`. `resolveAllPermutations()` precomputes the full `theme x brand` cross product once at module load; `App.tsx` toggles both via `useState` and indexes into it.
- **Loading is still static imports, not runtime-fetched.** Chose this deliberately for now (see conversation) since `manifest.json`'s `networkAccess.allowedDomains` is `["none"]` — nothing can fetch anything yet. If `tokens/` moves to being fetched at runtime, `resolve.ts`'s `registry` lookup becomes the thing to swap for `fetch()`, `resolveTokens`/`resolveAllPermutations` become async, and `manifest.json` needs real allowed domains. The resolution *logic* (merge order, brand-overrides-global) doesn't need to change.
- **Permutation count will keep growing.** Today: 2 themes x 2 brands = 4 precomputed trees. Every new brand or modifier axis multiplies this (the spec's own combinatorial-explosion warning). Fine at this scale; worth revisiting `resolveAllPermutations`'s eager-precompute approach if it grows much further.

## Ideas

- **Utopia support** — fluid type/space scales (utopia.fyi, `clamp()`-based) as a token source, instead of fixed step values.
- **Default/baseline token set** — commonly-needed tokens we don't have yet: text (font family/size/weight/line-height scale), and basic component-level tokens (button padding, radius, etc.) beyond raw color primitives.
- **Radix support** — likely Radix Colors (matched 12-step light/dark scales) as a primitive palette source; possibly also Radix UI component theming compatibility.
- **Auto dark/light mode** — follow the system/Figma appearance setting automatically for the `theme` modifier instead of a manual toggle.

## Plugin → repo sync

- **Sync edits made in the Figma plugin back into the source JSON files.** Plan from earlier discussion: stamp provenance (`{ file: "<source path>" }`) onto each token **in memory** at flatten time, per source file, before merging — not persisted into the JSON files, since it's derivable from which file you're reading and would go stale if files get renamed/moved. Survives `mergeTokenTrees` for free, since conflict resolution there copies the whole winning leaf object.
- **Open product question, not yet decided:** when someone edits a token whose value came from resolving an alias (e.g. `text.secondary` → `{color.grey.500}`), does the edit change the alias's *target* (`grey.500`, affecting everything else referencing it) or snap `text.secondary` to a literal value and break the alias? Needs a decision before the write-back path can be designed.
