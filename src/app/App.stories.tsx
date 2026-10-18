import type { Meta, StoryObj } from "@storybook/react-vite";
import { Providers } from "../components/providers";
import { App } from "./App";

const meta = {
  component: App,
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
} satisfies Meta<typeof App>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
