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
  toCssColor,
} from "../components/features/tokens/utils/flatten";

type DtcgOptions = { usesDtcg?: boolean };
type DurationValue = { value: number; unit: string };

function formatDuration(value: DurationValue): string {
  return `${value.value}${value.unit}`;
}

// Style Dictionary has no built-in transform for the DTCG "duration" type
// ({ value, unit } -> "200ms") -- see the `// TODO: add support for DTCG
// duration object value type` left in its own transition/css/shorthand
// source. This covers both standalone duration tokens and the duration/delay
// fields embedded directly (not by reference) in a transition token, mirroring
// how the built-in cubicBezier/css transform special-cases transition's
// timingFunction field.
StyleDictionary.registerTransform({
  name: "duration/css",
  type: "value",
  transitive: true,
  filter: (token, options: DtcgOptions) => {
    const type = options.usesDtcg ? token.$type : token.type;
    return type === "duration" || type === "transition";
  },
  transform: (token, _platform, options: DtcgOptions) => {
    const type = options.usesDtcg ? token.$type : token.type;
    const val = options.usesDtcg ? token.$value : token.value;

    if (type === "transition") {
      if (typeof val !== "object" || val === null) {
        return val; // already transformed to a string
      }
      const { duration, delay, ...rest } = val as Record<string, unknown>;
      return {
        ...rest,
        duration:
          typeof duration === "object" && duration !== null
            ? formatDuration(duration as DurationValue)
            : duration,
        delay:
          typeof delay === "object" && delay !== null
            ? formatDuration(delay as DurationValue)
            : delay,
      };
    }

    return typeof val === "object" && val !== null
      ? formatDuration(val as DurationValue)
      : val;
  },
});

// Style Dictionary has no built-in "gradient" transform at all. DTCG gradient
// stops resolve to raw DTCG color objects by the time this runs (reference
// resolution happens before this transform, but nothing converts the nested
// color to a CSS string the way color/css does for a top-level color token),
// so this reuses the same color -> CSS string logic the rest of the app uses
// for chip previews rather than reimplementing full color-space handling here.
StyleDictionary.registerTransform({
  name: "gradient/css",
  type: "value",
  transitive: true,
  filter: (token, options: DtcgOptions) =>
    (options.usesDtcg ? token.$type : token.type) === "gradient",
  transform: (token, _platform, options: DtcgOptions) => {
    const val = options.usesDtcg ? token.$value : token.value;
    if (!Array.isArray(val)) {
      return val; // already transformed to a string
    }
    const stops = val
      .map((stop) => `${toCssColor(stop.color)} ${stop.position * 100}%`)
      .join(", ");
    return `linear-gradient(90deg, ${stops})`;
  },
});

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
              // Same order as Style Dictionary's built-in "css" transform
              // group, with duration/css and gradient/css spliced in before
              // the shorthand transforms that depend on their output.
              transforms: [
                "attribute/cti",
                "name/kebab",
                "time/seconds",
                "html/icon",
                "size/rem",
                "color/css",
                "asset/url",
                "fontFamily/css",
                "cubicBezier/css",
                "duration/css",
                "gradient/css",
                "strokeStyle/css/shorthand",
                "border/css/shorthand",
                "typography/css/shorthand",
                "transition/css/shorthand",
                "shadow/css/shorthand",
              ],
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
