import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavContextProvier } from "../../features/layout/context/NavContext";
import { Providers } from "../../providers";
import { PrimitivesView } from "./primitives-view";

// Layout2 reads its own copy of NavContext, which Providers doesn't supply,
// so it gets its own provider here.
const meta = {
  component: PrimitivesView,
  decorators: [
    (Story) => (
      <Providers>
        <NavContextProvier>
          <Story />
        </NavContextProvier>
      </Providers>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PrimitivesView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
