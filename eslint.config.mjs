import { fileURLToPath } from 'node:url'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import figmaPlugin from '@figma/eslint-plugin-figma-plugins'
import storybook from 'eslint-plugin-storybook'
import cssModulesPlugin from './eslint-rules/css-modules-plugin.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default tseslint.config(
  eslint.configs.recommended,
  // @typescript-eslint/recommended-type-checked is too aggressive for
  // widget code...it doesn't seem to like JSX element return values or
  // unbundling the `widget` object for use* hooks. So we'll use
  // tseslint.configs.recommended instead.
  tseslint.configs.recommended,
  ...storybook.configs['flat/recommended'],
  {
    rules: {
      // allow underscore-prefixing of unused variables
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'css-modules': cssModulesPlugin },
    rules: {
      'css-modules/no-undef-class': 'error',
      'css-modules/no-unused-class': 'error',
    },
  },
  {
    // The Figma Plugin API rules need type info and only make sense for
    // code.ts, which is the only file that touches the `figma` global.
    files: ['src/code.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.main.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@figma/figma-plugins': figmaPlugin,
    },
    rules: {
      ...figmaPlugin.configs.recommended.rules,
    },
  },
  {
    ignores: ['dist', 'eslint.config.mjs', 'eslint-rules'],
  },
)
