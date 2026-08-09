import { ReactNode } from "react";
import styles from "./App.module.scss";
import { TokenChip } from "./TokenChip";
import { Layout } from "./components/Layout/Layout";
import { useTokensContext } from "./components/context/Tokens/useTokensContext";
import { FlatToken, isReference, TokenGroup } from "./tokens/flatten";

export function App() {
  const { theme, setTheme, brand, setBrand, combinedTokens, tokens } =
    useTokensContext();

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

const TokenWindowContainer = ({ children }: { children: ReactNode }) => {
  return <div className={styles.tokenWindowContainer}>{children}</div>;
};

const TokenWindow = ({
  title,
  tokens,
  combinedTokens,
}: {
  title: string;
  tokens: FlatToken[];
  combinedTokens: TokenGroup;
}) => {
  return (
    <div className={styles.tokenWindow}>
      <h1>{title}</h1>
      <div className={styles.tokenList}>
        {tokens.map((token) => (
          <TokenChip
            combinedTokens={combinedTokens}
            key={token.name}
            name={token.name}
            path={token.path.join(".")}
            value={token.value}
          />
        ))}
      </div>
    </div>
  );
};
