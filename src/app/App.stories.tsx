import type { Meta, StoryObj } from "@storybook/react-vite";
import { Providers } from "../components/Providers/Providers";
import { App } from "./App";

const meta = {
  title: "App",
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
