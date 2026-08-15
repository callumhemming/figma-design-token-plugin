import { useImperativeHandle, useRef, useState } from "react";
import { TokenChip } from "../tokens/components/TokenChip/TokenChip";
import { useTokensContext } from "../tokens/hooks/useTokensContext";
import { PRIMITIVE_TOKEN_TYPES } from "../tokens/utils/flatten";
import styles from "./TokenEditModal.module.scss";
export type TokenEditModalHandle = {
  open: (path: string) => void;
  close: () => void;
};

export const TokenEditModal = ({
  ref,
}: {
  ref: React.Ref<TokenEditModalHandle>;
}) => {
  const { tokens } = useTokensContext();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    open: (path) => {
      setSelectedPath(path);
      dialogRef.current?.showModal();
    },
    close: () => dialogRef.current?.close(),
  }));

  return (
    <dialog className={styles.root} ref={dialogRef}>
      <button
        className={styles.closeButton}
        onClick={() => dialogRef.current?.close()}
      >
        <p className={styles.closeIcon}>+</p>
      </button>
      <div className={styles.innerContainer}>
        <h1>Token edit modal</h1>
        <div className={styles.twoColumn}>
          <div>
            {PRIMITIVE_TOKEN_TYPES.map((type) => {
              const tokensByType = tokens.filter(
                (token) => token.type === type,
              );

              return (
                <>
                  <h2>{type}</h2>
                  <div className={styles.tokenChipContainer}>
                    {tokensByType.map((token) => (
                      <TokenChip
                        key={token.name}
                        path={token.path.join(".")}
                        onClick={() => setSelectedPath(token.path.join("."))}
                      />
                    ))}
                  </div>
                </>
              );
            })}
          </div>
          <div>
            <h2>Selected token</h2>
            {selectedPath ? (
              <TokenChip path={selectedPath} onClick={() => {}} />
            ) : (
              <p>No token selected.</p>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
};
