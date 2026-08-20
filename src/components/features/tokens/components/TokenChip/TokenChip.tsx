import { useTokensContext } from "../../hooks/useTokensContext";
import {
  formatResolvedValue,
  isReference,
  resolveValue,
  toCssColor,
  TokenType,
} from "../../utils/flatten";
import styles from "./TokenChip.module.scss";

export type TokenChipProps = {
  path: string;
  onClick: () => void;
};

function useResolvedTokenChip(path: string) {
  const { combinedTokens, tokens } = useTokensContext();
  // console.log(tokens);

  const token = tokens.find((candidate) => candidate.path.join(".") === path);
  if (!token) {
    throw new Error(`No token at path: "${path}"`);
  }
  const { name, value, type } = token;
  // console.log({ name, value, type, path });

  return { name, value, type, resolved: resolveValue(value, combinedTokens) };
}

export function ColorTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved, type } = useResolvedTokenChip(path);
  const cssColor = type === "color" ? toCssColor(resolved) : "#FFFF";

  return (
    <div className={styles.chip} onClick={onClick}>
      <span
        className={styles.swatch}
        style={{ background: cssColor }}
        title={cssColor}
      />
      <span className={styles.mono}>{`Color: ${cssColor}`}</span>
      {isReference(value) ? (
        <span className={styles.mono}>{`Reference: ${value}`}</span>
      ) : null}
      <span className={styles.mono}>{`Name: ${name}`}</span>
    </div>
  );
}

// Shared name/reference footer every chip below renders under its own
// type-specific preview.
function ChipFooter({
  name,
  value,
  valueLabel,
}: {
  name: string;
  value: unknown;
  valueLabel: string;
}) {
  return (
    <>
      <span className={styles.mono}>{valueLabel}</span>
      {isReference(value) ? (
        <span className={styles.mono}>{`Reference: ${value}`}</span>
      ) : null}
      <span className={styles.mono}>{`Name: ${name}`}</span>
    </>
  );
}

// Fallback for every $type without a dedicated preview yet: the six
// composite types (typography, border, strokeStyle, shadow, gradient,
// transition) -- see TODO.md's "No per-type editors beyond color".
export function GenericTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);

  return (
    <div className={styles.chip} onClick={onClick}>
      <ChipFooter
        name={name}
        value={value}
        valueLabel={"Value: " + formatResolvedValue(resolved)}
      />
    </div>
  );
}

const REM_TO_PX = 16;

export function DimensionTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);
  const dimension = resolved as { value: number; unit: "px" | "rem" };
  const px =
    dimension.unit === "rem" ? dimension.value * REM_TO_PX : dimension.value;

  return (
    <div className={styles.chip} onClick={onClick}>
      <div className={styles.previewBox}>
        <div
          className={styles.dimensionBarFill}
          style={{ width: `${Math.min(px, 88)}px` }}
        />
      </div>
      <ChipFooter
        name={name}
        value={value}
        valueLabel={`Dimension: ${formatResolvedValue(resolved)}`}
      />
    </div>
  );
}

export function DurationTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);
  const duration = resolved as { value: number; unit: "ms" | "s" };
  const ms = duration.unit === "s" ? duration.value * 1000 : duration.value;

  return (
    <div className={styles.chip} onClick={onClick}>
      <div className={styles.previewBox}>
        <div
          className={styles.durationDot}
          style={{ animationDuration: `${ms}ms` }}
        />
      </div>
      <ChipFooter
        name={name}
        value={value}
        valueLabel={`Duration: ${formatResolvedValue(resolved)}`}
      />
    </div>
  );
}

export function FontFamilyTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);
  const fontFamily = Array.isArray(resolved)
    ? resolved.join(", ")
    : String(resolved);

  return (
    <div className={styles.chip} onClick={onClick}>
      <span className={styles.sampleSwatch}>
        <span className={styles.fontSample} style={{ fontFamily }}>
          Ag
        </span>
      </span>
      <ChipFooter
        name={name}
        value={value}
        valueLabel={`Font: ${fontFamily}`}
      />
    </div>
  );
}

export function FontWeightTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);
  const fontWeight = resolved as number | string;

  return (
    <div className={styles.chip} onClick={onClick}>
      <span className={styles.sampleSwatch}>
        <span className={styles.fontSample} style={{ fontWeight }}>
          Ag
        </span>
      </span>
      <ChipFooter
        name={name}
        value={value}
        valueLabel={`Weight: ${fontWeight}`}
      />
    </div>
  );
}

export function NumberTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);

  return (
    <div className={styles.chip} onClick={onClick}>
      <span className={styles.sampleSwatch}>
        <span className={styles.numberValue}>
          {formatResolvedValue(resolved)}
        </span>
      </span>
      <ChipFooter
        name={name}
        value={value}
        valueLabel={`Number: ${formatResolvedValue(resolved)}`}
      />
    </div>
  );
}

// Renders the actual easing curve from its 4 control points, cubic-bezier's
// own convention: P0 = (0,0), P3 = (1,1), P1 = (x1,y1) and P2 = (x2,y2) are
// the two free control points. SVG y grows downward, so y is flipped to draw
// it the way an easing graph is normally read (progress increasing upward).
export function CubicBezierTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);
  const [x1, y1, x2, y2] = resolved as number[];
  const flip = (y: number) => 100 - y * 100;

  return (
    <div className={styles.chip} onClick={onClick}>
      <div className={styles.previewBox}>
        <svg
          className={styles.cubicBezierSvg}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d={`M0,100 C${x1 * 100},${flip(y1)} ${x2 * 100},${flip(y2)} 100,0`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={4}
          />
        </svg>
      </div>
      <ChipFooter
        name={name}
        value={value}
        valueLabel={`Bezier: ${formatResolvedValue(resolved)}`}
      />
    </div>
  );
}

export const TOKEN_CHIP_BY_TYPE: Partial<
  Record<TokenType, (props: TokenChipProps) => React.JSX.Element>
> = {
  color: ColorTokenChip,
  dimension: DimensionTokenChip,
  duration: DurationTokenChip,
  fontFamily: FontFamilyTokenChip,
  fontWeight: FontWeightTokenChip,
  number: NumberTokenChip,
  cubicBezier: CubicBezierTokenChip,
};
