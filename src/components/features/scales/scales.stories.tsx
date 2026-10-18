import type { Meta, StoryObj } from "@storybook/react-vite";

import { Scales } from "./scales";

const meta = {
  component: Scales,
} satisfies Meta<typeof Scales>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
