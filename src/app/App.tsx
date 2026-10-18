import { Typography } from "../components/ui/typography";
import { useNavContext } from "../components/features/layout/context/NavContext";
import { Layout } from "../components/features/layout";
import { ResolverSettingsForm } from "../components/features/settings/components/resolver-settings-form";
import {
  TokenWindow,
  TokenWindowContainer,
} from "../components/features/tokens/components/token-window";
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
      <Typography variant="heading1">Settings</Typography>
      <ResolverSettingsForm />
    </div>
  );
};

const TokenView = () => {
  const { tokens, tokenSources } = useTokensContext();

  const { slug } = useNavContext();

  const activeTypeTokens = tokens.filter((token) => token.type === slug);

  const primitiveTokens = activeTypeTokens.filter((token) =>
    tokenSources[token.path.join(".")]?.includes("/primitives/"),
  );
  const semanticTokens = activeTypeTokens.filter((token) =>
    tokenSources[token.path.join(".")]?.includes("/semantic/"),
  );
  const componentTokens = activeTypeTokens.filter((token) =>
    tokenSources[token.path.join(".")]?.includes("/component/"),
  );
  return (
    <TokenWindowContainer>
      {COMPOSITE_TOKEN_TYPES.includes(slug) ? null : (
        <TokenWindow title={`Primitive ${slug}`} tokens={primitiveTokens} />
      )}

      <TokenWindow
        title={`Semantic ${slug}`}
        tokens={semanticTokens}
        addableType={slug === "typography" ? "typography" : undefined}
      />

      {componentTokens.length > 0 ? (
        <TokenWindow title={`Component ${slug}`} tokens={componentTokens} />
      ) : null}
    </TokenWindowContainer>
  );
};
