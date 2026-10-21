import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Tag } from "./tag";

const meta = {
  component: Tag,
  args: { children: "color.light.json" },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Removable: Story = {
  args: { onRemove: fn() },
};
