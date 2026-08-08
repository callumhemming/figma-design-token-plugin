import {
  FlatToken,
  isReference,
  resolveValue,
  toCssColor,
  TokenGroup,
} from "./tokens/flatten";

type TokenChipProps = {
  name: FlatToken["name"];
  value: FlatToken["value"];
  combinedTokens: TokenGroup;
};

export function TokenChip({ name, value, combinedTokens }: TokenChipProps) {
  const cssColor = toCssColor(resolveValue(value, combinedTokens));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 8px",
        borderRadius: 6,
        border: "1px solid rgba(0,0,0,0.1)",
        width: "fit-content",
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          background: cssColor,
          border: "1px solid rgba(0,0,0,0.15)",
          flexShrink: 0,
        }}
      />

      <span style={{ fontSize: 12, fontFamily: "monospace" }}>
        {cssColor}
      </span>
      {isReference(value) ? (
        <span style={{ fontSize: 12, fontFamily: "monospace" }}>{value}</span>
      ) : null}
      <span style={{ fontSize: 12, fontFamily: "monospace" }}>{name}</span>
    </div>
  );
}
