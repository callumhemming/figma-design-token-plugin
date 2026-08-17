import { useImperativeHandle, useRef, useState } from "react";
import {
  GenericTokenChip,
  TOKEN_CHIP_BY_TYPE,
} from "../tokens/components/TokenChip/TokenChip";
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
        <h1>{`Token edit modal | ${selectedPath}`} </h1>
        <div className={styles.twoColumn}>
          <div>
            {PRIMITIVE_TOKEN_TYPES.map((type) => {
              const tokensByType = tokens.filter(
                (token) => token.type === type,
              );
              const Chip = TOKEN_CHIP_BY_TYPE[type] ?? GenericTokenChip;

              return (
                <>
                  <h2>{type}</h2>
                  <div className={styles.tokenChipContainer}>
                    {tokensByType.map((token) => (
                      <Chip
                        key={token.name}
                        path={token.path.join(".")}
                        onClick={() => {}}
                      />
                    ))}
                  </div>
                </>
              );
            })}
          </div>
          <div>
            <h2>Selected token</h2>
            <div className={styles.tokenSlot}>
              {selectedPath ? (
                (() => {
                  const selectedType = tokens.find(
                    (token) => token.path.join(".") === selectedPath,
                  )?.type;
                  const Chip =
                    (selectedType && TOKEN_CHIP_BY_TYPE[selectedType]) ??
                    GenericTokenChip;
                  return <Chip path={selectedPath} onClick={() => {}} />;
                })()
              ) : (
                <p>No token selected.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};
