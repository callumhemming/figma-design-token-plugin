// typography: [
//   { property: "fontFamily", expectedType: "fontFamily" },
//   { property: "fontSize", expectedType: "dimension" },
//   { property: "fontWeight", expectedType: "fontWeight" },
//   { property: "letterSpacing", expectedType: "dimension" },  // missing today
//   { property: "lineHeight", expectedType: "number" },
// ],

import clsx from "clsx";
import { CSSProperties, ReactNode, useState } from "react";
import {
  DimensionTokenChip,
  FontFamilyTokenChip,
  FontWeightTokenChip,
  NumberTokenChip,
} from "../../../tokens/components/TokenChip/TokenChip";
import { useTokensContext } from "../../../tokens/hooks/useTokensContext";
import { resolveValue, TokenType } from "../../../tokens/utils/flatten";
import { typographyStyleFromResolved } from "../../../tokens/utils/typographyStyle";
import { getDraggedToken } from "../../dragAndDrop";
import { useTokenEditModalContext } from "../../hooks/useTokenEditModalContext";
import styles from "./TypographyEdit.module.scss";

const PLACEHOLDER_PATHS = {
  fontFamily: "fontFamily.sans",
  fontSize: "fontSize.200",
  fontWeight: "fontWeight.regular",
  letterSpacing: "space.100",
  lineHeight: "lineHeight.100",
};

const SlotPlaceholder = ({
  children,
  isSelected,
  expectedType,
  placeholderPath,
  onDropToken,
}: {
  children: ReactNode;
  isSelected: boolean;
  expectedType: TokenType;
  placeholderPath: string;
  onDropToken: (path: string) => void;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { draggedTokenType, draggedTokenPath } = useTokenEditModalContext();
  // Excludes the token already occupying this slot -- accepting it would
  // write placeholderPath -> {placeholderPath}, a direct self-reference
  // that sends resolveValue's alias-following into infinite recursion.
  const isValidTarget =
    draggedTokenType === expectedType && draggedTokenPath !== placeholderPath;

  return (
    <div
      className={clsx(styles.slotPlaceholder, {
        [styles.selected]: isSelected,
        [styles.dragOver]: isDragOver,
      })}
      onDragOver={(event) => {
        // Skipping preventDefault() for an invalid target is what actually
        // blocks the drop -- the browser only allows a drop (and shows a
        // "no-drop" cursor otherwise) on elements that called it during
        // dragover, so an invalid slot never fires onDrop at all.
        if (!isValidTarget) return;

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);

        const dragged = getDraggedToken(event.dataTransfer);
        if (!dragged || dragged.type !== expectedType) return;
        if (dragged.path === placeholderPath) return; // see isValidTarget above

        onDropToken(dragged.path);
      }}
    >
      {children}
    </div>
  );
};

function useTypographyPreviewStyle(
  paths: typeof PLACEHOLDER_PATHS,
): CSSProperties {
  const { tokens, combinedTokens } = useTokensContext();

  const resolvedAt = (path: string) => {
    const token = tokens.find((candidate) => candidate.path.join(".") === path);
    if (!token) {
      throw new Error(`No token at path: "${path}"`);
    }
    return resolveValue(token.value, combinedTokens);
  };

  return typographyStyleFromResolved({
    fontFamily: resolvedAt(paths.fontFamily),
    fontSize: resolvedAt(paths.fontSize),
    fontWeight: resolvedAt(paths.fontWeight),
    letterSpacing: resolvedAt(paths.letterSpacing),
    lineHeight: resolvedAt(paths.lineHeight),
  });
}

export const TypographyEdit = () => {
  const previewStyle = useTypographyPreviewStyle(PLACEHOLDER_PATHS);

  const [selectedSlot, setSelectedToken] = useState<number | null>(null);
  const { setTokenTypeFilter } = useTokenEditModalContext();
  const { setTokenValue } = useTokensContext();

  // Points the placeholder path itself at whatever was dropped, turning it
  // into a reference -- resolveValue() already follows references
  // transitively, so both the slot chip and the live preview above pick up
  // the new value with no extra plumbing.
  const assignSlot = (placeholderPath: string, droppedPath: string) => {
    setTokenValue(placeholderPath, `{${droppedPath}}`);
  };

  return (
    <div className={styles.root}>
      <h3>Body1</h3>
      <div className={styles.output}>
        <span style={previewStyle}>
          The quick brown fox jumps over the lazy dog
        </span>
      </div>
      <div className={styles.tokenTreeContainer}>
        <span>Font family</span>
        <SlotPlaceholder
          isSelected={selectedSlot === 1}
          expectedType="fontFamily"
          placeholderPath={PLACEHOLDER_PATHS.fontFamily}
          onDropToken={(path) => assignSlot(PLACEHOLDER_PATHS.fontFamily, path)}
        >
          <FontFamilyTokenChip
            path={PLACEHOLDER_PATHS.fontFamily}
            onClick={() => {
              setSelectedToken(1);

              setTokenTypeFilter("fontFamily");
            }}
          />
        </SlotPlaceholder>

        <span>Font size </span>
        <SlotPlaceholder
          isSelected={selectedSlot === 2}
          expectedType="dimension"
          placeholderPath={PLACEHOLDER_PATHS.fontSize}
          onDropToken={(path) => assignSlot(PLACEHOLDER_PATHS.fontSize, path)}
        >
          <DimensionTokenChip
            path={PLACEHOLDER_PATHS.fontSize}
            onClick={() => {
              setSelectedToken(2);

              setTokenTypeFilter("dimension");
            }}
          />
        </SlotPlaceholder>

        <span>Font weight </span>

        <SlotPlaceholder
          isSelected={selectedSlot === 3}
          expectedType="fontWeight"
          placeholderPath={PLACEHOLDER_PATHS.fontWeight}
          onDropToken={(path) => assignSlot(PLACEHOLDER_PATHS.fontWeight, path)}
        >
          <FontWeightTokenChip
            path={PLACEHOLDER_PATHS.fontWeight}

            onClick={() => {
              setSelectedToken(3);

              setTokenTypeFilter("fontWeight");
            }}
          />
        </SlotPlaceholder>

        <span>Letter spacing </span>

        <SlotPlaceholder
          isSelected={selectedSlot === 4}
          expectedType="dimension"
          placeholderPath={PLACEHOLDER_PATHS.letterSpacing}
          onDropToken={(path) =>
            assignSlot(PLACEHOLDER_PATHS.letterSpacing, path)
          }
        >
          <DimensionTokenChip
            path={PLACEHOLDER_PATHS.letterSpacing}

            onClick={() => {
              setSelectedToken(4);

              setTokenTypeFilter("dimension");
            }}
          />
        </SlotPlaceholder>

        <span>Line height </span>
        <SlotPlaceholder
          isSelected={selectedSlot === 5}
          expectedType="number"
          placeholderPath={PLACEHOLDER_PATHS.lineHeight}
          onDropToken={(path) => assignSlot(PLACEHOLDER_PATHS.lineHeight, path)}
        >
          <NumberTokenChip
            path={PLACEHOLDER_PATHS.lineHeight}
            onClick={() => {
              setSelectedToken(5);

              setTokenTypeFilter("number");
            }}
          />
        </SlotPlaceholder>
      </div>
    </div>
  );
};
