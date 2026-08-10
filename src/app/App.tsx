import { Layout } from "../components/Layout/Layout";
import { useTokensContext } from "../features/tokens/hooks/useTokensContext";
import {
  TokenWindow,
  TokenWindowContainer,
} from "../features/tokens/components/TokenWindow/TokenWindow";

export function App() {
  const { combinedTokens, tokens, tokenSources, activeType } =
    useTokensContext();

  const activeTypeTokens = tokens.filter((token) => token.type === activeType);
  // Split by which registry entry defined the leaf — every source lives
  // under a "/primitives/" or "/semantic/" segment by convention — rather
  // than by whether the value happens to be a reference, so this works
  // uniformly for composites too (e.g. border.default is a literal object,
  // not a `{ref}` string, but it's still a semantic token).
  const primitiveTokens = activeTypeTokens.filter((token) =>
    tokenSources[token.path.join(".")]?.includes("/primitives/"),
  );
  const semanticTokens = activeTypeTokens.filter((token) =>
    tokenSources[token.path.join(".")]?.includes("/semantic/"),
  );

  return (
    <Layout>
      <TokenWindowContainer>
        <TokenWindow
          title={`Primitive ${activeType}`}
          tokens={primitiveTokens}
          combinedTokens={combinedTokens}
        />
        <TokenWindow
          title={`Semantic ${activeType}`}
          tokens={semanticTokens}
          combinedTokens={combinedTokens}
        />
      </TokenWindowContainer>
    </Layout>
  );
}
