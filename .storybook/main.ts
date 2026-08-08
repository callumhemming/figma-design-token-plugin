import type { StorybookConfig } from '@storybook/react-vite';
import react from '@vitejs/plugin-react';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/react-vite",
  // Our project's own vite.config.* files are named for the plugin's dual
  // build (main.ts as an IIFE lib, ui.mts inlined into one HTML file), so
  // neither matches Vite's default config lookup and Storybook never picks
  // them up. Add the React plugin here so JSX compiles with the automatic
  // runtime instead of falling back to the classic transform.
  async viteFinal(config) {
    return {
      ...config,
      plugins: [...(config.plugins ?? []), react()],
    };
  },
};
export default config;