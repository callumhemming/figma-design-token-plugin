import { ReactNode } from "react";
import { FlatToken, TokenGroup } from "../../utils/flatten";
import { TokenChip } from "../TokenChip/TokenChip";
import styles from "./TokenWindow.module.scss";

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
        {tokens.length === 0 ? (
          <p className={styles.empty}>No tokens of this type here.</p>
        ) : (
          tokens.map((token) => (
            <TokenChip
              combinedTokens={combinedTokens}
              key={token.name}
              name={token.name}
              path={token.path.join(".")}
              type={token.type}
              value={token.value}
            />
          ))
        )}
      </div>
    </div>
  );
};
