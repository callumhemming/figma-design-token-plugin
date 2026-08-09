import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardEvent, RefObject, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import styles from "./TokenChip.module.scss";
import { useTokensContext } from "./components/context/Tokens/useTokensContext";
import {
  FlatToken,
  isReference,
  ReferencePath,
  referencePaths,
  resolveValue,
  toCssColor,
  TokenGroup,
} from "./tokens/flatten";
import ClickAwayListener from "./utils/ClickAwayListener";

type TokenChipProps = {
  name: FlatToken["name"];
  path: string;
  value: FlatToken["value"];
  combinedTokens: TokenGroup;
};

export function TokenChip({
  name,
  path,
  value,
  combinedTokens,
}: TokenChipProps) {
  const cssColor = toCssColor(resolveValue(value, combinedTokens));

  const [isEditing, setIsEditing] = useState(false);

  const submitRef = useRef<() => void>(() => {});

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
        title={value}
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
  const [isRefOpen, setIsRefOpen] = useState(false);
  // -1 means "nothing highlighted" — the dropdown opens on focus alone, so
  // defaulting this to 0 made the very first Enter press silently select
  // whatever happened to be first in the list instead of submitting the
  // form (the actual, intended behavior of an untouched Enter press).
  const [activeIndex, setActiveIndex] = useState(-1);

  const filteredReferencePaths = referencePaths.filter(({ path }) =>
    path.toLowerCase().includes(refInputValue.toLowerCase()),
  );
  const clampedActiveIndex = Math.min(
    activeIndex,
    filteredReferencePaths.length - 1,
  );

  function selectReferencePath(path: string) {
    setValue("ref", path, { shouldValidate: true });
    setIsRefOpen(false);
  }

  function handleRefKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isRefOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredReferencePaths.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (event.key === "Enter") {
      const active =
        clampedActiveIndex >= 0
          ? filteredReferencePaths[clampedActiveIndex]
          : undefined;
      if (active) {
        event.preventDefault();
        selectReferencePath(active.path);
      }
    } else if (event.key === "Escape") {
      setIsRefOpen(false);
    }
  }

  const { onChange: onRefChange, ...refField } = register("ref");

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <input {...register("hex")}></input>

      <div className={styles.comboboxWrapper}>
        <input
          {...refField}
          autoComplete="off"
          onChange={(event) => {
            onRefChange(event);
            setActiveIndex(-1);
            setIsRefOpen(true);
          }}
          onFocus={() => setIsRefOpen(true)}
          onKeyDown={handleRefKeyDown}
        />
        {isRefOpen && filteredReferencePaths.length > 0 ? (
          <ul className={styles.dropdown}>
            {filteredReferencePaths.map(({ path, type }, index) => (
              <li
                key={path}
                // preventDefault here only stops the input from blurring;
                // the actual selection happens on click, which fires after
                // this mousedown has finished bubbling to ClickAwayListener's
                // document-level handler. Selecting here instead would
                // unmount this <li> mid-bubble, so by the time that handler
                // ran, event.target would already be detached and
                // ref.current.contains() would (wrongly) report an outside
                // click, closing the whole form.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectReferencePath(path)}
                className={
                  index === clampedActiveIndex
                    ? `${styles.option} ${styles.optionActive}`
                    : styles.option
                }
              >
                <span>{path}</span>
                <span className={styles.optionType}>{type}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <input {...register("label")}></input>
    </form>
  );
};
