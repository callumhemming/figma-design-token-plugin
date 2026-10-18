import type { Meta, StoryObj } from "@storybook/react-vite";

import { ColorInput } from "./color-input";

const meta = {
  component: ColorInput,
  args: { defaultValue: "#3e63dd" },
} satisfies Meta<typeof ColorInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { "aria-invalid": true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
