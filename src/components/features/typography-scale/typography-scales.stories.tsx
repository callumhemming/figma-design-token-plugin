import type { Meta, StoryObj } from "@storybook/react-vite";

import { TypographyScale } from "./typography-scales";

const meta = {
  component: TypographyScale,
} satisfies Meta<typeof TypographyScale>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
