import { ReactNode, useRef } from "react";
import {
  TokenEditModal,
  TokenEditModalHandle,
} from "../../../token-edit-modal/TokenEditModal";
import { FlatToken } from "../../utils/flatten";
import { TokenChip } from "../TokenChip/TokenChip";
import styles from "./TokenWindow.module.scss";

export const TokenWindowContainer = ({ children }: { children: ReactNode }) => {
  return <div className={styles.tokenWindowContainer}>{children}</div>;
};

export const TokenWindow = ({
  title,
  tokens,
}: {
  title: string;
  tokens: FlatToken[];
}) => {
  const modalRef = useRef<TokenEditModalHandle>(null);
  return (
    <div className={styles.tokenWindow}>
      <h1>{title}</h1>
      <div className={styles.tokenList}>
        {tokens.length === 0 ? (
          <p className={styles.empty}>No tokens of this type here.</p>
        ) : (
          tokens.map((token) => (
            <TokenChip
              key={token.name}
              path={token.path.join(".")}
              onClick={() => {
                modalRef.current?.open(token.path.join("."));
              }}
            />
          ))
        )}
      </div>

      <TokenEditModal ref={modalRef} />
    </div>
  );
};
