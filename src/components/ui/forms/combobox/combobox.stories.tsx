import type { Meta, StoryObj } from "@storybook/react-vite";

import { Combobox } from "./combobox";

const meta = {
  component: Combobox,
  args: {
    options: [
      { value: "{p.font-size.step-0}", meta: "1rem" },
      { value: "{p.font-size.step-1}", meta: "1.2rem" },
      { value: "{p.font-size.step-2}", meta: "1.44rem" },
      { value: "{p.font-size.step-3}", meta: "1.728rem" },
    ],
    placeholder: "Pick a font size",
  },
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: "{p.font-size.step-1}" },
};

export const Invalid: Story = {
  args: { defaultValue: "{p.font-size.step-9}", "aria-invalid": true },
};

export const Disabled: Story = {
  args: { defaultValue: "{p.font-size.step-1}", disabled: true },
};
