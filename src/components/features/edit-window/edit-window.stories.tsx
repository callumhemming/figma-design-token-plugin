import type { Meta, StoryObj } from "@storybook/react-vite";

import { EditWindow } from "./edit-window";

const meta = {
  component: EditWindow,
  argTypes: {
    windowType: {
      control: "inline-radio",
      options: ["color", "scale", "typography"],
    },
  },
} satisfies Meta<typeof EditWindow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Color: Story = {
  args: { windowType: "color" },
};

export const Scale: Story = {
  args: { windowType: "scale" },
};

export const Typography: Story = {
  args: { windowType: "typography" },
};
