import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select } from "./select";

const meta = {
  component: Select,
  args: {
    options: [
      { value: "color", label: "Color" },
      { value: "dimension", label: "Dimension" },
    ],
    placeholder: "Pick a type",
    defaultValue: "",
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { "aria-invalid": true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
