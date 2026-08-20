import type { Meta, StoryObj } from "@storybook/react-vite";
import { Providers } from "../../../../../components/Providers/Providers";
import { TypographyEdit } from "./TypographyEdit";

const meta = {
  title: "TypographyEdit",
  component: TypographyEdit,
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
} satisfies Meta<typeof TypographyEdit>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
