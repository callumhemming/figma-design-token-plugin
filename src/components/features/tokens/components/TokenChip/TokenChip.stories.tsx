import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Providers } from "../../../../Providers/Providers";
import {
  BorderTokenChip,
  ColorTokenChip,
  CubicBezierTokenChip,
  DimensionTokenChip,
  DurationTokenChip,
  FontFamilyTokenChip,
  FontWeightTokenChip,
  GenericTokenChip,
  GradientTokenChip,
  ShadowTokenChip,
  StrokeStyleTokenChip,
  TransitionTokenChip,
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

export const Typography: Story = {
  render: (args) => <TypographyTokenChip {...args} />,
  args: { path: "typography.heading" },
};

export const Border: Story = {
  render: (args) => <BorderTokenChip {...args} />,
  args: { path: "border.default" },
};

export const Shadow: Story = {
  render: (args) => <ShadowTokenChip {...args} />,
  args: { path: "shadow.lg" },
};

export const Transition: Story = {
  render: (args) => <TransitionTokenChip {...args} />,
  args: { path: "transition.fast" },
};

export const Gradient: Story = {
  render: (args) => <GradientTokenChip {...args} />,
  args: { path: "gradient.brandFade" },
};

export const StrokeStyle: Story = {
  render: (args) => <StrokeStyleTokenChip {...args} />,
  args: { path: "strokeStyle.dashed" },
};

// number is the only type left with no dedicated preview -- see TODO.md
// "No per-type editors beyond color".
export const Generic: Story = {
  render: (args) => <GenericTokenChip {...args} />,
  args: { path: "lineHeight.100" },
};
