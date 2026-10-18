import { fileURLToPath } from 'node:url'
import noUnusedCssModulesClass from './stylelint-rules/no-unused-css-modules-class.mjs'

// Absolute so it resolves the same from the CLI and the VS Code extension,
// whose working directory isn't always the repo root.
const tokensCss = fileURLToPath(new URL('./src/styles/tokens.css', import.meta.url))

export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-css-modules'],
  plugins: [
    'stylelint-csstree-validator',
    'stylelint-value-no-unknown-custom-properties',
    noUnusedCssModulesClass,
  ],
  rules: {
    'csstree/validator': { syntaxExtensions: ['sass'] },
    'css-modules/no-unused-class': true,
    // Flags var(--…) typos against the generated design tokens.
    'csstools/value-no-unknown-custom-properties': [
      true,
      { importFrom: [tokensCss] },
    ],
    // This codebase's CSS Modules classes are accessed as `styles.fooBar` in
    // JS/TSX, so they're camelCase rather than the kebab-case this rule
    // defaults to.
    'selector-class-pattern': null,
    // Auto-merging grid-template-areas/-columns/-rows into the `grid-template`
    // shorthand isn't safe to do blindly — layout.module.scss's rows/areas
    // already don't line up 1:1, so leave this for a human to untangle.
    'declaration-block-no-redundant-longhand-properties': null,
  },
}
