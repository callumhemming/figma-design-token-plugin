import { zodResolver } from "@hookform/resolvers/zod";
import { RefObject, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import styles from "./TokenChip.module.scss";
import { useTokensContext } from "../../hooks/useTokensContext";
import {
  FlatToken,
  formatResolvedValue,
  isReference,
  ReferencePath,
  referencePaths,
  resolveValue,
  toCssColor,
  TokenGroup,
} from "../../utils/flatten";
import ClickAwayListener from "../../../../patterns/ClickAwayListener/ClickAwayListener";
import { Combobox } from "../../../../patterns/Combobox/Combobox";

type TokenChipProps = {
  name: FlatToken["name"];
  path: string;
  type: FlatToken["type"];
  value: FlatToken["value"];
  combinedTokens: TokenGroup;
};

export function TokenChip({
  name,
  path,
  type,
  value,
  combinedTokens,
}: TokenChipProps) {
  const resolved = resolveValue(value, combinedTokens);

  const [isEditing, setIsEditing] = useState(false);

  const submitRef = useRef<() => void>(() => {});

  // Editing is only built for color today — hex input, swatch preview, the
  // whole TokenChipForm below assumes a color-shaped value. Every other
  // $type renders read-only until a per-type editor exists.
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

  if (isEditing) {
    const availableReferencePaths = referencePaths(combinedTokens).map(
      ({ path, ...rest }) => ({ path: `{${path}}`, ...rest }),
    );

    return (
      <ClickAwayListener onClickAway={() => submitRef.current()}>
        <TokenChipForm
          submitRef={submitRef}
          path={path}
          ref={isReference(value) ? value : cssColor}
          label={name}
          hex={cssColor}
          referencePaths={availableReferencePaths}
          onCommitted={() => setIsEditing(false)}
        />
      </ClickAwayListener>
    );
  }
  return (
    <div
      className={styles.chip}
      onClick={() => {
        setIsEditing(true);
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

const HEX_PATTERN = /^#[0-9a-f]{3,8}$/i;

const TokenChipForm = ({
  hex,
  ref,
  label,
  path,
  referencePaths,
  onCommitted,
  submitRef,
}: {
  hex: string;
  ref: string;
  label: string;
  path: string;
  referencePaths: ReferencePath[];
  onCommitted: () => void;
  submitRef: RefObject<() => void>;
}) => {
  const { setTokenValue } = useTokensContext();

  const schema = z.object({
    hex: z.string(),
    ref: z
      .string()
      .refine(
        (value) =>
          HEX_PATTERN.test(value) ||
          referencePaths.some((option) => option.path === value),
        { message: "Must be a hex color or a valid {token.path} reference" },
      ),
    label: z.string(),
  });
  const { register, watch, setValue, handleSubmit } = useForm({
    defaultValues: { hex, ref, label },
    resolver: zodResolver(schema),
  });

  function onSubmit(data: { ref: string }) {
    setTokenValue(path, data.ref);
    onCommitted();
  }

  submitRef.current = handleSubmit(onSubmit);

  const refInputValue = watch("ref");
  const { onChange: onRefChange, ...refField } = register("ref");

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <input {...register("hex")}></input>

      <Combobox
        value={refInputValue}
        options={referencePaths.map(({ path, type }) => ({
          value: path,
          meta: type,
        }))}
        onSelect={(path) => setValue("ref", path, { shouldValidate: true })}
        inputProps={{ ...refField, onChange: onRefChange }}
      />
      <button type="submit">Submit</button>

      <input {...register("label")}></input>
    </form>
  );
};
