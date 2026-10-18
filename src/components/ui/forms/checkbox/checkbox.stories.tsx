import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./checkbox";

const meta = {
  component: Checkbox,
  args: { "aria-label": "Checkbox" },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { "aria-invalid": true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const CheckedDisabled: Story = {
  args: { defaultChecked: true, disabled: true },
};
