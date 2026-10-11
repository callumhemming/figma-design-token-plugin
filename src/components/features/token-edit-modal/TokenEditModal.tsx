import { Fragment, useImperativeHandle, useRef, useState } from "react";
import {
  GenericTokenChip,
  TOKEN_CHIP_BY_TYPE,
} from "../tokens/components/TokenChip/TokenChip";
import { Button } from "../../ui/Button";
import { Typography } from "../../ui/Typography";
import { useTokensContext } from "../tokens/hooks/useTokensContext";
import {
  COMPOSITE_TOKEN_SHAPES,
  PRIMITIVE_TOKEN_TYPES,
  referencesPath,
  TokenType,
} from "../tokens/utils/flatten";
import styles from "./TokenEditModal.module.scss";
import { TypographyEdit } from "./components/TypographyEdit/TypographyEdit";
import { setDraggedToken } from "./dragAndDrop";
import { TokenEditModalContext } from "./hooks/useTokenEditModalContext";
export type TokenEditModalHandle = {
  open: (path: string) => void;
  close: () => void;
};

export const TokenEditModal = ({
  ref,
}: {
  ref: React.Ref<TokenEditModalHandle>;
}) => {
  const { tokens, removeToken } = useTokensContext();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const [tokenTypeFilter, setTokenTypeFilter] = useState<TokenType | null>(
    null,
  );
  const [draggedTokenType, setDraggedTokenType] = useState<TokenType | null>(
    null,
  );
  const [draggedTokenPath, setDraggedTokenPath] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    open: (path) => {
      setSelectedPath(path);
      dialogRef.current?.showModal();
    },
    close: () => dialogRef.current?.close(),
  }));

  const selectedType = selectedPath
    ? tokens.find((token) => token.path.join(".") === selectedPath)?.type
    : undefined;

  // Which primitive types could actually fill a slot on the right: a
  // composite token's slots (per COMPOSITE_TOKEN_SHAPES, e.g. typography ->
  // fontFamily/dimension/fontWeight/number), or just its own type when
  // editing a primitive -- or a composite with no COMPOSITE_TOKEN_SHAPES
  // entry, e.g. gradient -- directly. Falls back to every primitive type
  // when nothing's selected yet (or the lookup somehow misses) rather than
  // showing an empty column.
  const compatibleTypes: readonly TokenType[] = selectedType
    ? COMPOSITE_TOKEN_SHAPES[selectedType]
      ? // Dedupe -- a shape can repeat an expectedType across properties
        // (e.g. shadow's offsetX/offsetY/blur/spread are all "dimension"),
        // which would otherwise render that heading once per property.
        [
          ...new Set(
            COMPOSITE_TOKEN_SHAPES[selectedType].map(
              (shape) => shape.expectedType as TokenType,
            ),
          ),
        ]
      : [selectedType]
    : PRIMITIVE_TOKEN_TYPES;

  // Other tokens whose own value aliases the selected one -- deleting it
  // out from under them would leave a dangling {reference} that throws
  // "Unresolved token reference" the next time it's resolved, so removal
  // is blocked while any exist rather than silently breaking them.
  const referencingTokens = selectedPath
    ? tokens.filter(
        (token) =>
          token.path.join(".") !== selectedPath &&
          referencesPath(token.value, selectedPath),
      )
    : [];

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
      <dialog className={styles.root} ref={dialogRef}>
        <button
          className={styles.closeButton}
          onClick={() => dialogRef.current?.close()}
        >
          <Typography className={styles.closeIcon}>+</Typography>
        </button>
        <div className={styles.innerContainer}>
          <Typography variant="heading1">{`Token edit modal | ${selectedPath}`}</Typography>
          <div className={styles.twoColumn}>
            <div>
              {compatibleTypes.map((type) => {
                const tokensByType = tokens.filter(
                  (token) => token.type === type,
                );
                const Chip = TOKEN_CHIP_BY_TYPE[type] ?? GenericTokenChip;

                if (tokenTypeFilter !== null && type !== tokenTypeFilter)
                  return;

                return (
                  <Fragment key={type}>
                    <Typography variant="heading2">{type}</Typography>
                    <div className={styles.tokenChipContainer}>
                      {tokensByType.map((token) => (
                        <div
                          key={token.name}
                          className={styles.draggableChip}
                          draggable
                          onDragStart={(event) => {
                            const path = token.path.join(".");
                            setDraggedToken(event.dataTransfer, {
                              path,
                              type: token.type,
                            });
                            setDraggedTokenType(token.type);
                            setDraggedTokenPath(path);
                          }}
                          onDragEnd={() => {
                            setDraggedTokenType(null);
                            setDraggedTokenPath(null);
                          }}
                        >
                          <Chip
                            path={token.path.join(".")}
                            onClick={() => {}}
                          />
                        </div>
                      ))}
                    </div>
                  </Fragment>
                );
              })}
            </div>
            <div>
              <div className={styles.selectedTokenHeader}>
                <Typography variant="heading2">Selected token</Typography>
                {selectedPath ? (
                  <Button
                    disabled={referencingTokens.length > 0}
                    title={
                      referencingTokens.length > 0
                        ? `Still referenced by: ${referencingTokens.map((token) => token.path.join(".")).join(", ")}`
                        : undefined
                    }
                    onClick={() => {
                      removeToken(selectedPath);
                      setSelectedPath(null);
                      dialogRef.current?.close();
                    }}
                  >
                    Delete token
                  </Button>
                ) : null}
              </div>
              <div className={styles.tokenSlot}>
                {selectedPath ? (
                  selectedType === "typography" ? (
                    <TypographyEdit />
                  ) : (
                    (() => {
                      const Chip =
                        (selectedType && TOKEN_CHIP_BY_TYPE[selectedType]) ??
                        GenericTokenChip;
                      return <Chip path={selectedPath} onClick={() => {}} />;
                    })()
                  )
                ) : (
                  <Typography>No token selected.</Typography>
                )}
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </TokenEditModalContext.Provider>
  );
};
