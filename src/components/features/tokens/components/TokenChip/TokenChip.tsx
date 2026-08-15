import { useTokensContext } from "../../hooks/useTokensContext";
import {
  formatResolvedValue,
  isReference,
  resolveValue,
  toCssColor,
} from "../../utils/flatten";
import styles from "./TokenChip.module.scss";

type TokenChipProps = {
  path: string;
  onClick: () => void;
};

export function TokenChip({ path, onClick }: TokenChipProps) {
  const { combinedTokens, tokens } = useTokensContext();

  const token = tokens.find((candidate) => candidate.path.join(".") === path);
  if (!token) {
    throw new Error(`No token at path: "${path}"`);
  }
  const { name, type, value } = token;

  const resolved = resolveValue(value, combinedTokens);

  if (type !== "color") {
    return (
      <div className={styles.chip}>
        <span className={styles.mono}>{name}</span>
        {isReference(value) ? (
          <span className={styles.mono}>{value}</span>
        ) : null}
        <span className={styles.mono}>{formatResolvedValue(resolved)}</span>
      </div>
    );
  }

  const cssColor = toCssColor(resolved);

  return (
    <div
      className={styles.chip}
      onClick={() => {
        onClick();
      }}
    >
      <span
        className={styles.swatch}
        style={{ background: cssColor }}
        title={cssColor}
      />

      <span className={styles.mono}>{cssColor}</span>
      {isReference(value) ? <span className={styles.mono}>{value}</span> : null}
      <span className={styles.mono}>{name}</span>
    </div>
  );
}
