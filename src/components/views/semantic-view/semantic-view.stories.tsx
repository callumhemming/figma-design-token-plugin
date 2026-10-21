import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavContextProvier } from "../../features/layout/context/NavContext";
import { Providers } from "../../providers";
import { SemanticView } from "./semantic-view";

// Layout2 reads its own copy of NavContext, which Providers doesn't supply,
// so it gets its own provider here.
const meta = {
  component: SemanticView,
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
  // Picks the edit window's form until it follows the selected token.
  args: { editWindowType: "color" },
  argTypes: {
    editWindowType: {
      control: "inline-radio",
      options: ["color", "scale", "typography"],
    },
  },
} satisfies Meta<typeof SemanticView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
