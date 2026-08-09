import type { Meta, StoryObj } from "@storybook/react-vite";
import { App } from "./App";
import { TokensContextProvider } from "../features/tokens/context/TokensContextProvider";

const meta = {
  title: "App",
  component: App,
  decorators: [
    (Story) => (
      <TokensContextProvider>
        <Story />
      </TokensContextProvider>
    ),
  ],
} satisfies Meta<typeof App>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
