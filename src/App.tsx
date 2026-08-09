import { useEffect, useState } from "react";

import styles from "./App.module.scss";
import { TokenChip } from "./TokenChip";
import { useTokensContext } from "./components/context/Tokens/useTokensContext";
import { isReference } from "./tokens/flatten";

type PluginMessage = { type: string };

export function App() {
  const [status, setStatus] = useState("idle");
  const { theme, setTheme, brand, setBrand, combinedTokens, tokens } =
    useTokensContext();

  useEffect(() => {
    const onMessage = (
      event: MessageEvent<{ pluginMessage: PluginMessage }>,
    ) => {
      console.log("Message from plugin:", event.data.pluginMessage);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

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
      <div className={styles.tokenList}>
        {primitiveColorTokens.map((token) => (
          <TokenChip
            combinedTokens={combinedTokens}
            key={token.name}
            name={token.name}
            path={token.path.join(".")}
            value={token.value}
          />
        ))}
      </div>
      <h1>Semantic Colors</h1>
      <div className={styles.tokenList}>
        {semanticColorTokens.map((token) => (
          <TokenChip
            combinedTokens={combinedTokens}
            key={token.name}
            name={token.name}
            path={token.path.join(".")}
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
