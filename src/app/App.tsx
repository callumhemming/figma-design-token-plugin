import { Layout } from "../Layout/Layout";
import { useTokensContext } from "../features/tokens/hooks/useTokensContext";
import {
  TokenWindow,
  TokenWindowContainer,
} from "../features/tokens/components/TokenWindow/TokenWindow";
import { isReference } from "../tokens/flatten";

export function App() {
  const { combinedTokens, tokens } = useTokensContext();

  const colorTokens = tokens.filter((token) => token.type === "color");
  const primitiveColorTokens = colorTokens.filter(
    (token) => !isReference(token.value),
  );
  const semanticColorTokens = colorTokens.filter((token) =>
    isReference(token.value),
  );

  return (
    <Layout>
      <TokenWindowContainer>
        <TokenWindow
          title={"Primitive colors"}
          tokens={primitiveColorTokens}
          combinedTokens={combinedTokens}
        />
        <TokenWindow
          title={"Semantic colors"}
          tokens={semanticColorTokens}
          combinedTokens={combinedTokens}
        />
      </TokenWindowContainer>
    </Layout>
  );
}
