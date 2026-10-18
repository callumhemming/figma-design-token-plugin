import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextInput } from "./text-input";

const meta = {
  component: TextInput,
  args: { placeholder: "Placeholder" },
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { "aria-invalid": true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
