import { ReactNode } from "react";
import styles from "./TokenWindow.module.scss";
import { TokenChip } from "../TokenChip/TokenChip";
import { FlatToken, TokenGroup } from "../../../../tokens/flatten";

export const TokenWindowContainer = ({ children }: { children: ReactNode }) => {
  return <div className={styles.tokenWindowContainer}>{children}</div>;
};

export const TokenWindow = ({
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
