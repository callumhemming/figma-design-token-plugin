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
import {
  formatResolvedValue,
  resolveValue,
} from "../../../tokens/utils/flatten";
import styles from "./TypographyEdit.module.scss";

// Placeholder paths, standing in until this takes a typography token path as
// a prop and reads each sub-property's real reference off it. No letterSpacing
// primitive exists yet (see the missing entry noted above), so that slot
// reuses fontSize.200 as a stand-in dimension token rather than pointing at
// something that doesn't exist.
const PLACEHOLDER_PATHS = {
  fontFamily: "fontFamily.sans",
  fontSize: "fontSize.200",
  fontWeight: "fontWeight.regular",
  letterSpacing: "fontSize.200",
  lineHeight: "lineHeight.100",
};

const noop = () => {};
const SlotPlaceholder = ({
  children,
  isSelected,
}: {
  children: ReactNode;
  isSelected: boolean;
}) => {
  return (
    <div
      className={clsx(styles.slotPlaceholder, {
        [styles.selected]: isSelected,
      })}
    >
      {children}
    </div>
  );
};

// Resolves each of PLACEHOLDER_PATHS' primitives to a live CSSProperties
// object for the preview text -- reuses the same resolveValue() the token
// chips already use for their own previews, rather than a separate
// Style-Dictionary build (that pipeline is async and whole-tree, meant for
// generating CSS/JSON output, not a single edit's synchronous live preview).
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

  const fontFamily = resolvedAt(paths.fontFamily);
  const fontWeight = resolvedAt(paths.fontWeight);
  const lineHeight = resolvedAt(paths.lineHeight);

  return {
    fontFamily: Array.isArray(fontFamily)
      ? fontFamily.join(", ")
      : String(fontFamily),
    fontSize: formatResolvedValue(resolvedAt(paths.fontSize)),
    fontWeight: fontWeight as CSSProperties["fontWeight"],
    letterSpacing: formatResolvedValue(resolvedAt(paths.letterSpacing)),
    lineHeight: lineHeight as CSSProperties["lineHeight"],
  };
}

export const TypographyEdit = () => {
  const previewStyle = useTypographyPreviewStyle(PLACEHOLDER_PATHS);

  const [selectedSlot, setSelectedToken] = useState<number | null>(null);

  return (
    <div className={styles.root}>
      <div className={styles.tokenTreeContainer}>
        <h3>Body1</h3>
        <span>Font family</span>
        <SlotPlaceholder isSelected={selectedSlot === 1}>
          <FontFamilyTokenChip
            path={PLACEHOLDER_PATHS.fontFamily}
            onClick={() => setSelectedToken(1)}
          />
        </SlotPlaceholder>

        <span>Font size </span>
        <SlotPlaceholder isSelected={selectedSlot === 2}>
          <DimensionTokenChip
            path={PLACEHOLDER_PATHS.fontSize}
            onClick={() => setSelectedToken(2)}
          />
        </SlotPlaceholder>

        <span>Font weight </span>

        <SlotPlaceholder isSelected={selectedSlot === 3}>
          <FontWeightTokenChip
            path={PLACEHOLDER_PATHS.fontWeight}

            onClick={() => setSelectedToken(3)}
          />
        </SlotPlaceholder>

        <span>Letter spacing </span>

        <SlotPlaceholder isSelected={selectedSlot === 4}>
          <DimensionTokenChip
            path={PLACEHOLDER_PATHS.letterSpacing}

            onClick={() => setSelectedToken(4)}
          />
        </SlotPlaceholder>

        <span>Line height </span>
        <SlotPlaceholder isSelected={selectedSlot === 5}>
          <NumberTokenChip
            path={PLACEHOLDER_PATHS.lineHeight}
            onClick={() => setSelectedToken(5)}
          />
        </SlotPlaceholder>
      </div>
      <div className={styles.output}>
        <span style={previewStyle}>
          The quick brown fox jumps over the lazy dog
        </span>
      </div>
    </div>
  );
};
