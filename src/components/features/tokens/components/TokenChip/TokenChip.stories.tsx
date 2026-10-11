import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Providers } from "../../../../Providers/Providers";
import {
  ColorTokenChip,
  DimensionTokenChip,
  FontFamilyTokenChip,
  FontWeightTokenChip,
  GenericTokenChip,
  TypographyTokenChip,
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
  args: { path: "p.color.slate.9" },
};

export const ColorAlias: Story = {
  render: (args) => <ColorTokenChip {...args} />,
  args: { path: "s.color.primary.solid" },
};

export const ColorWithAlpha: Story = {
  render: (args) => <ColorTokenChip {...args} />,
  args: { path: "p.color.transparent" },
};

export const Dimension: Story = {
  render: (args) => <DimensionTokenChip {...args} />,
  args: { path: "p.spacing.4" },
};

export const FontFamily: Story = {
  render: (args) => <FontFamilyTokenChip {...args} />,
  args: { path: "p.font-family.sans" },
};

export const FontWeight: Story = {
  render: (args) => <FontWeightTokenChip {...args} />,
  args: { path: "p.font-weight.bold" },
};

export const Typography: Story = {
  render: (args) => <TypographyTokenChip {...args} />,
  args: { path: "s.typography.heading1" },
};

export const TypographyAlias: Story = {
  render: (args) => <TypographyTokenChip {...args} />,
  args: { path: "c.button.typography" },
};

// number is the only type left with no dedicated preview -- see TODO.md
// "No per-type editors beyond color".
export const Generic: Story = {
  render: (args) => <GenericTokenChip {...args} />,
  args: { path: "p.line-height.normal" },
};
