import { Typography } from "../../../../ui/Typography";
import { useTokensContext } from "../../hooks/useTokensContext";
import {
  COMPOSITE_TOKEN_SHAPES,
  CompositeTokenProperty,
  formatResolvedValue,
  isReference,
  resolveValue,
  toCssColor,
  TokenType,
} from "../../utils/flatten";
import { typographyStyleFromResolved } from "../../utils/typographyStyle";
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
      <Typography>{`Color: ${cssColor}`}</Typography>
      {isReference(value) ? (
        <Typography>{`Reference: ${value}`}</Typography>
      ) : null}
      <Typography>{`Name: ${name}`}</Typography>
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
      <Typography>{valueLabel}</Typography>
      {isReference(value) ? (
        <Typography>{`Reference: ${value}`}</Typography>
      ) : null}
      <Typography>{`Name: ${name}`}</Typography>
    </>
  );
}

// Fallback for any $type without a dedicated preview -- every composite
// type now has one below, so today this only covers whatever isn't in
// TOKEN_CHIP_BY_TYPE at all (see TODO.md's "No per-type editors beyond
// color" for the primitive side of that gap).
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
        <Typography
          variant="inherit"
          as="span"
          className={styles.fontSample}
          style={{ fontFamily }}
        >
          Ag
        </Typography>
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
        <Typography
          variant="inherit"
          as="span"
          className={styles.fontSample}
          style={{ fontWeight }}
        >
          Ag
        </Typography>
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
        <Typography as="span" className={styles.numberValue}>
          {formatResolvedValue(resolved)}
        </Typography>
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

// One badge per named sub-property of a composite $value (per
// COMPOSITE_TOKEN_SHAPES), showing which token it's made up of -- the
// referenced path when the sub-property is a `{...}` alias (the normal
// case; see global/semantic/typography.json), or the literal value itself
// otherwise. Generic over any composite shape, not just typography, so a
// future border/shadow/... chip can reuse it as-is.
function CompositeSubTokenRow({
  shape,
  rawValue,
}: {
  shape: CompositeTokenProperty[];
  rawValue: unknown;
}) {
  // The whole composite aliases another one (e.g. c.button.typography ->
  // {s.typography.button}): name that token rather than its sub-properties.
  if (isReference(rawValue)) {
    return (
      <div className={styles.compositeRow}>
        <span className={styles.compositeBadge} title="alias">
          <Typography variant="caption">{rawValue.slice(1, -1)}</Typography>
        </span>
      </div>
    );
  }
  const properties = rawValue as Record<string, unknown>;

  return (
    <div className={styles.compositeRow}>
      {shape.map(({ property }) => {
        const raw = properties[property];
        if (raw === undefined) return null; // this token doesn't set that sub-property

        const label = isReference(raw)
          ? raw.slice(1, -1)
          : formatResolvedValue(raw);

        return (
          <span
            key={property}
            className={styles.compositeBadge}
            title={property}
          >
            <Typography variant="caption">{label}</Typography>
          </span>
        );
      })}
    </div>
  );
}

// A composite token's $value is an object of named sub-properties (color,
// dimension, fontFamily, ...) rather than one scalar -- GenericTokenChip's
// formatResolvedValue fallback renders that as raw JSON. This is the first
// composite with a nicer preview: live styled sample text built from the
// token's own resolved sub-properties, the same way the primitive chips
// above preview their own value, plus a slim row naming each sub-token it's
// made up of (CompositeSubTokenRow) instead of a JSON blob. The other
// composites (border, shadow, gradient, transition, strokeStyle) still fall
// back to GenericTokenChip -- see TODO.md.
export function TypographyTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);
  const typography = resolved as {
    fontFamily: unknown;
    fontSize: unknown;
    fontWeight: unknown;
    lineHeight: unknown;
    letterSpacing?: unknown;
  };
  const sampleStyle = typographyStyleFromResolved(typography);

  return (
    <div className={styles.chip} onClick={onClick}>
      <div className={styles.previewBox}>
        <Typography
          variant="inherit"
          as="span"
          className={styles.typographySample}
          style={sampleStyle}
        >
          Ag
        </Typography>
      </div>
      <CompositeSubTokenRow
        shape={COMPOSITE_TOKEN_SHAPES.typography}
        rawValue={value as Record<string, unknown>}
      />
      <Typography>{`Name: ${name}`}</Typography>
    </div>
  );
}

// Shared by Border/Shadow below -- resolveValue() leaves a dimension
// sub-property as a { value, unit } object, same as a standalone dimension
// token, so this is the same rem->px normalization DimensionTokenChip does.
function dimensionToPx(resolved: unknown): number {
  const dimension = resolved as { value: number; unit: "px" | "rem" };
  return dimension.unit === "rem"
    ? dimension.value * REM_TO_PX
    : dimension.value;
}

export function BorderTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);
  const border = resolved as { color: unknown; width: unknown; style: unknown };

  return (
    <div className={styles.chip} onClick={onClick}>
      <div className={styles.previewBox}>
        <div
          className={styles.borderSample}
          style={{
            borderWidth: `${dimensionToPx(border.width)}px`,
            borderStyle: String(border.style),
            borderColor: toCssColor(border.color),
          }}
        />
      </div>
      <CompositeSubTokenRow
        shape={COMPOSITE_TOKEN_SHAPES.border}
        rawValue={value as Record<string, unknown>}
      />
      <Typography>{`Name: ${name}`}</Typography>
    </div>
  );
}

export function ShadowTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);
  const shadow = resolved as {
    color: unknown;
    offsetX: unknown;
    offsetY: unknown;
    blur: unknown;
    spread: unknown;
  };
  const boxShadow = [shadow.offsetX, shadow.offsetY, shadow.blur, shadow.spread]
    .map((dimension) => `${dimensionToPx(dimension)}px`)
    .concat(toCssColor(shadow.color))
    .join(" ");

  return (
    <div className={styles.chip} onClick={onClick}>
      {/* .previewBox's overflow: hidden would clip the shadow at the box
      edge, so this uses the unclipped variant instead. */}
      <div className={styles.unclippedPreviewBox}>
        <div className={styles.shadowSample} style={{ boxShadow }} />
      </div>
      <CompositeSubTokenRow
        shape={COMPOSITE_TOKEN_SHAPES.shadow}
        rawValue={value as Record<string, unknown>}
      />
      <Typography>{`Name: ${name}`}</Typography>
    </div>
  );
}

// Reuses .durationDot/duration-slide wholesale (see DurationTokenChip above)
// with animation-duration/-delay/-timing-function overridden from the
// transition's own resolved values, rather than a separate animation --
// same "slide across the box" demo, now driven by the real easing curve
// instead of a fixed ease-in-out.
export function TransitionTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);
  const transition = resolved as {
    duration: unknown;
    delay: unknown;
    timingFunction: unknown;
  };
  const ms = (resolved: unknown) => {
    const duration = resolved as { value: number; unit: "ms" | "s" };
    return duration.unit === "s" ? duration.value * 1000 : duration.value;
  };
  const [x1, y1, x2, y2] = transition.timingFunction as number[];

  return (
    <div className={styles.chip} onClick={onClick}>
      <div className={styles.previewBox}>
        <div
          className={styles.durationDot}
          style={{
            animationDuration: `${ms(transition.duration)}ms`,
            animationDelay: `${ms(transition.delay)}ms`,
            animationTimingFunction: `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`,
          }}
        />
      </div>
      <CompositeSubTokenRow
        shape={COMPOSITE_TOKEN_SHAPES.transition}
        rawValue={value as Record<string, unknown>}
      />
      <Typography>{`Name: ${name}`}</Typography>
    </div>
  );
}

// gradient's $value is an array of { color, position } stops, not a flat
// object of named sub-properties -- it doesn't fit COMPOSITE_TOKEN_SHAPES
// (see TODO.md), so this builds its own row of stop badges rather than
// using CompositeSubTokenRow.
export function GradientTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);
  const resolvedStops = resolved as { color: unknown; position: number }[];
  const rawStops = value as { color: unknown; position: number }[];

  const gradientCss = `linear-gradient(90deg, ${resolvedStops
    .map((stop) => `${toCssColor(stop.color)} ${stop.position * 100}%`)
    .join(", ")})`;

  return (
    <div className={styles.chip} onClick={onClick}>
      <div className={styles.previewBox}>
        <div
          className={styles.gradientBarFill}
          style={{ background: gradientCss }}
        />
      </div>
      <div className={styles.compositeRow}>
        {rawStops.map((stop, index) => {
          const label = isReference(stop.color)
            ? stop.color.slice(1, -1)
            : formatResolvedValue(stop.color);
          return (
            <span
              key={index}
              className={styles.compositeBadge}
              title={`position ${stop.position}`}
            >
              <Typography variant="caption">
                {`${label} @${Math.round(stop.position * 100)}%`}
              </Typography>
            </span>
          );
        })}
      </div>
      <Typography>{`Name: ${name}`}</Typography>
    </div>
  );
}

// strokeStyle's own $value is a plain keyword ("solid"/"dashed"/"dotted"),
// not an object of sub-properties -- unlike the composites above, it isn't
// "made up of" other tokens, so there's no CompositeSubTokenRow here, just
// the keyword rendered as an actual rule.
export function StrokeStyleTokenChip({ path, onClick }: TokenChipProps) {
  const { name, value, resolved } = useResolvedTokenChip(path);
  const borderStyle = typeof resolved === "string" ? resolved : "solid";

  return (
    <div className={styles.chip} onClick={onClick}>
      <div className={styles.previewBox}>
        <div className={styles.strokeStyleSample} style={{ borderStyle }} />
      </div>
      <ChipFooter
        name={name}
        value={value}
        valueLabel={`Style: ${formatResolvedValue(resolved)}`}
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
  typography: TypographyTokenChip,
  border: BorderTokenChip,
  shadow: ShadowTokenChip,
  transition: TransitionTokenChip,
  gradient: GradientTokenChip,
  strokeStyle: StrokeStyleTokenChip,
};
