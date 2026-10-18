import type { Meta, StoryObj } from "@storybook/react-vite";

import { NumberInput } from "./number-input";

const meta = {
  component: NumberInput,
  args: { defaultValue: 16 },
} satisfies Meta<typeof NumberInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { "aria-invalid": true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
