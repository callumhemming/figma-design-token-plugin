import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Providers } from "../../../../../components/Providers/Providers";
import { TokenType } from "../../../tokens/utils/flatten";
import { TokenEditModalContext } from "../../hooks/useTokenEditModalContext";
import { TypographyEdit } from "./TypographyEdit";

const WithTokenEditModalContext = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tokenTypeFilter, setTokenTypeFilter] = useState<TokenType | null>(
    null,
  );
  const [draggedTokenType, setDraggedTokenType] = useState<TokenType | null>(
    null,
  );
  const [draggedTokenPath, setDraggedTokenPath] = useState<string | null>(null);

  return (
    <TokenEditModalContext.Provider
      value={{
        tokenTypeFilter,
        setTokenTypeFilter,
        draggedTokenType,
        setDraggedTokenType,
        draggedTokenPath,
        setDraggedTokenPath,
      }}
    >
      {children}
    </TokenEditModalContext.Provider>
  );
};

const meta = {
  title: "TypographyEdit",
  component: TypographyEdit,
  decorators: [
    (Story) => (
      <Providers>
        <WithTokenEditModalContext>
          <Story />
        </WithTokenEditModalContext>
      </Providers>
    ),
  ],
} satisfies Meta<typeof TypographyEdit>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
