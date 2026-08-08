import { useEffect, useState } from "react";

import { TokenChip } from "./TokenChip";
import { flattenTokens, isReference } from "./tokens/flatten";
import { Brand, resolveAllPermutations, Theme } from "./tokens/resolve";

// Resolved once per theme x brand combination at module load, not on every
// toggle — cheap given how little JSON this is, and it turns switching
// either into a plain lookup instead of re-merging on each click.
const resolved = resolveAllPermutations();

type PluginMessage = { type: string };

export function App() {
  const [status, setStatus] = useState("idle");
  const [theme, setTheme] = useState<Theme>("light");
  const [brand, setBrand] = useState<Brand>("acme");

  useEffect(() => {
    const onMessage = (
      event: MessageEvent<{ pluginMessage: PluginMessage }>,
    ) => {
      console.log("Message from plugin:", event.data.pluginMessage);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const combinedTokens = resolved[theme][brand];

  const tokens = flattenTokens(combinedTokens).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // TokenChip only knows how to render color values, so this is scoped to
  // type === "color" for now. Split primitive vs semantic by whether the
  // (unresolved) value is an alias — every semantic token in this token set
  // is defined as a reference, every primitive is a literal.
  const colorTokens = tokens.filter((token) => token.type === "color");
  const primitiveColorTokens = colorTokens.filter(
    (token) => !isReference(token.value),
  );
  const semanticColorTokens = colorTokens.filter((token) =>
    isReference(token.value),
  );

  return (
    <>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Theme: {theme}
      </button>
      <button onClick={() => setBrand(brand === "acme" ? "globex" : "acme")}>
        Brand: {brand}
      </button>
      <h1>Primitive Colors</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {primitiveColorTokens.map((token) => (
          <TokenChip
            combinedTokens={combinedTokens}
            key={token.name}
            name={token.name}
            value={token.value}
          />
        ))}
      </div>
      <h1>Semantic Colors</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {semanticColorTokens.map((token) => (
          <TokenChip
            combinedTokens={combinedTokens}
            key={token.name}
            name={token.name}
            value={token.value}
          />
        ))}
      </div>
      <button
        onClick={() => {
          setStatus("creating");
          parent.postMessage({ pluginMessage: { type: "create" } }, "*");
        }}
      >
        {status === "idle" ? "Create" : "Creating…"}
      </button>
    </>
  );
}
