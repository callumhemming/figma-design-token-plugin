import { ReactNode, useRef, useState } from "react";
import {
  TokenEditModal,
  TokenEditModalHandle,
} from "../../../token-edit-modal/TokenEditModal";
import { Button } from "../../../../ui/Button";
import { Typography } from "../../../../ui/Typography";
import { useTokensContext } from "../../hooks/useTokensContext";
import { COMPOSITE_TOKEN_SHAPES, FlatToken } from "../../utils/flatten";
import { GenericTokenChip, TOKEN_CHIP_BY_TYPE } from "../TokenChip/TokenChip";
import styles from "./TokenWindow.module.scss";

// "fontSize" -> "font-size", matching the token files' kebab-case groups.
function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

export const TokenWindowContainer = ({ children }: { children: ReactNode }) => {
  return <div className={styles.tokenWindowContainer}>{children}</div>;
};

// A token name may become the last segment of a dot-joined path (see
// flattenTokens/setLeafNode) -- disallowing "." keeps that round-trip safe,
// and the rest is just kept sane rather than DTCG-mandated.
const TOKEN_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

// New typography tokens always land in the one file that actually declares
// $type: "typography" tokens (see resolver.json's "typography" set) --
// unlike color, typography has no theme/brand modifier, so there's no
// ambiguity about which file "the" typography source is.
const TYPOGRAPHY_SOURCE_FILE = "global/semantic/typography.json";

function AddTokenForm({
  placeholder,
  onSubmit,
}: {
  placeholder: string;
  // Returns an error message to display, or null on success.
  onSubmit: (name: string) => string | null;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className={styles.addTokenForm}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
          setError("Name is required.");
          return;
        }
        if (!TOKEN_NAME_PATTERN.test(trimmed)) {
          setError("Use only letters, numbers, - and _.");
          return;
        }

        const result = onSubmit(trimmed);
        if (result) {
          setError(result);
          return;
        }
        setName("");
        setError(null);
      }}
    >
      <div className={styles.addTokenRow}>
        <input
          type="text"
          placeholder={placeholder}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit">+ Add</Button>
      </div>
      {error ? (
        <Typography variant="caption" as="p" className={styles.addTokenError}>
          {error}
        </Typography>
      ) : null}
    </form>
  );
}

export const TokenWindow = ({
  title,
  tokens,
  addableType,
}: {
  title: string;
  tokens: FlatToken[];
  // Only "typography" for now -- it's the only composite type with a real
  // sub-property editor (TypographyEdit) for a freshly-created token to
  // land in. Extend this union alongside a new editor, not ahead of one.
  addableType?: "typography";
}) => {
  const modalRef = useRef<TokenEditModalHandle>(null);
  const { tokens: allTokens, addToken } = useTokensContext();

  // Defaults every sub-property to a token of the expected type whose path
  // has a group named after the property (e.g. "fontSize" ->
  // p.font-size.step-0, not p.border-width.1 -- same $type: "dimension",
  // but nonsensical as a font size), so the new composite resolves immediately
  // and sensibly instead of landing broken or nonsensical. The user then
  // drags in whatever they actually want via TypographyEdit's slots.
  function addTypographyToken(name: string): string | null {
    const path = `s.typography.${name}`;
    if (allTokens.some((token) => token.path.join(".") === path)) {
      return `A token already exists at "${path}".`;
    }

    const value: Record<string, string> = {};
    for (const {
      property,
      expectedType,
    } of COMPOSITE_TOKEN_SHAPES.typography) {
      const fallback = allTokens.find(
        (token) =>
          token.type === expectedType &&
          token.path.includes(toKebabCase(property)),
      );
      if (!fallback) {
        return `No ${expectedType} token exists yet to default "${property}" to.`;
      }
      value[property] = `{${fallback.path.join(".")}}`;
    }

    addToken(TYPOGRAPHY_SOURCE_FILE, path, {
      $type: "typography",
      $value: value,
    });
    modalRef.current?.open(path);
    return null;
  }

  return (
    <div className={styles.tokenWindow}>
      <Typography variant="heading1">{title}</Typography>
      {addableType === "typography" ? (
        <AddTokenForm
          placeholder="New typography token name"
          onSubmit={addTypographyToken}
        />
      ) : null}
      <div className={styles.tokenList}>
        {tokens.length === 0 ? (
          <Typography variant="caption" as="p" className={styles.empty}>
            No tokens of this type here.
          </Typography>
        ) : (
          tokens.map((token) => {
            const Chip = TOKEN_CHIP_BY_TYPE[token.type] ?? GenericTokenChip;
            return (
              <Chip
                key={token.name}
                path={token.path.join(".")}
                onClick={() => {
                  modalRef.current?.open(token.path.join("."));
                }}
              />
            );
          })
        )}
      </div>

      <TokenEditModal ref={modalRef} />
    </div>
  );
};
