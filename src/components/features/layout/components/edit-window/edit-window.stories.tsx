import type { Meta, StoryObj } from "@storybook/react-vite";

import { EditWindow } from "./edit-window";

const meta = {
  component: EditWindow,
} satisfies Meta<typeof EditWindow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
