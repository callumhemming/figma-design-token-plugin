import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Providers } from "../../../../Providers/Providers";
import {
  ColorTokenChip,
  CubicBezierTokenChip,
  DimensionTokenChip,
  DurationTokenChip,
  FontFamilyTokenChip,
  FontWeightTokenChip,
  GenericTokenChip,
} from "./TokenChip";

// Real token paths from src/tokens, served at /tokens by Storybook's
// staticDirs (.storybook/main.ts) -- each chip resolves against the actual
// registry, not mock data, so this also exercises resolveValue/flattenTokens
// for real.
const meta = {
  title: "Tokens/TokenChip",
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
  args: {
    onClick: fn(),
  },
} satisfies Meta<{ path: string; onClick: () => void }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Color: Story = {
  render: (args) => <ColorTokenChip {...args} />,
  args: { path: "color.grey.500" },
};

export const ColorWithAlpha: Story = {
  render: (args) => <ColorTokenChip {...args} />,
  args: { path: "color.brand.500" },
};

export const Dimension: Story = {
  render: (args) => <DimensionTokenChip {...args} />,
  args: { path: "fontSize.200" },
};

export const Duration: Story = {
  render: (args) => <DurationTokenChip {...args} />,
  args: { path: "duration.fast" },
};

export const FontFamily: Story = {
  render: (args) => <FontFamilyTokenChip {...args} />,
  args: { path: "fontFamily.sans" },
};

export const FontWeight: Story = {
  render: (args) => <FontWeightTokenChip {...args} />,
  args: { path: "fontWeight.bold" },
};

export const CubicBezier: Story = {
  render: (args) => <CubicBezierTokenChip {...args} />,
  args: { path: "cubicBezier.easeOut" },
};

// number, and every composite type (typography, border, strokeStyle, shadow,
// gradient, transition) fall back to this until they get dedicated chips --
// see TODO.md "No per-type editors beyond color".
export const Generic: Story = {
  render: (args) => <GenericTokenChip {...args} />,
  args: { path: "lineHeight.100" },
};
