import { useEffect } from "react";
import StyleDictionary from "style-dictionary";
import { useNavContext } from "../components/features/Layout/context/NavContext";
import { Layout } from "../components/features/Layout/Layout";
import { ResolverSettingsForm } from "../components/features/settings/ResolverSettingsForm";
import {
  TokenWindow,
  TokenWindowContainer,
} from "../components/features/tokens/components/TokenWindow/TokenWindow";
import { useTokensContext } from "../components/features/tokens/hooks/useTokensContext";
import {
  COMPOSITE_TOKEN_TYPES,
  TOKEN_TYPES,
} from "../components/features/tokens/utils/flatten";

export function App() {
  const { slug } = useNavContext();
  return (
    <Layout>
      {TOKEN_TYPES.includes(slug) ? <TokenView /> : null}
      {slug === "settings" ? <SettingsView /> : null}
    </Layout>
  );
}

const SettingsView = () => {
  return (
    <div>
      <h1>Settings</h1>
      <ResolverSettingsForm />
    </div>
  );
};

const TokenView = () => {
  const { combinedTokens, tokens, tokenSources } = useTokensContext();

  const { slug } = useNavContext();

  useEffect(() => {
    async function runStyleDictionaryInBrowser(): Promise<void> {
      try {
        const sd = new StyleDictionary({
          tokens: combinedTokens,
          platforms: {
            css: {
              transformGroup: "css",
              files: [{ format: "css/variables" }],
            },
            json: {
              transformGroup: "js",
              files: [{ format: "json/nested" }],
            },
          },
        });

        const cssOutput = await sd.formatPlatform("css");
        const jsonOutput = await sd.formatPlatform("json");

        console.log("[Style Dictionary] CSS output", cssOutput);
        console.log("[Style Dictionary] JSON output", jsonOutput);
      } catch (error) {
        console.error("[Style Dictionary] Browser run failed", error);
      }
    }

    void runStyleDictionaryInBrowser();
  }, [combinedTokens]);

  const activeTypeTokens = tokens.filter((token) => token.type === slug);

  const primitiveTokens = activeTypeTokens.filter((token) =>
    tokenSources[token.path.join(".")]?.includes("/primitives/"),
  );
  const semanticTokens = activeTypeTokens.filter((token) =>
    tokenSources[token.path.join(".")]?.includes("/semantic/"),
  );
  return (
    <TokenWindowContainer>
      {COMPOSITE_TOKEN_TYPES.includes(slug) ? null : (
        <TokenWindow title={`Primitive ${slug}`} tokens={primitiveTokens} />
      )}

      <TokenWindow title={`Semantic ${slug}`} tokens={semanticTokens} />
    </TokenWindowContainer>
  );
};
