import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Button, ButtonColor, ButtonSize, ButtonVariant } from "./index";

const variants: ButtonVariant[] = ["solid", "soft", "outline", "ghost"];
const colors: ButtonColor[] = ["primary", "secondary", "accent", "neutral"];
const sizes: ButtonSize[] = [1, 2, 3];

const meta = {
  title: "Button",
  component: Button,
  args: {
    children: "Button",
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: variants },
    color: { control: "inline-radio", options: colors },
    size: { control: "inline-radio", options: sizes },
    icon: { control: "select", options: [undefined, "cog"] },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: { icon: "cog" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

const grid = {
  display: "grid",
  gap: 12,
  alignItems: "center",
  justifyItems: "start",
} as const;

export const VariantsAndColors: Story = {
  render: (args) => (
    <div
      style={{ ...grid, gridTemplateColumns: `repeat(${colors.length}, auto)` }}
    >
      {variants.flatMap((variant) =>
        colors.map((color) => (
          <Button
            key={`${variant}-${color}`}
            {...args}
            variant={variant}
            color={color}
          >
            {`${variant} ${color}`}
          </Button>
        )),
      )}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div
      style={{ ...grid, gridTemplateColumns: `repeat(${sizes.length}, auto)` }}
    >
      {sizes.map((size) => (
        <Button key={size} {...args} size={size} icon="cog">
          {`Size ${size}`}
        </Button>
      ))}
    </div>
  ),
};
