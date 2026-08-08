import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardEvent, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
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
  value: FlatToken["value"];
  combinedTokens: TokenGroup;
};

export function TokenChip({ name, value, combinedTokens }: TokenChipProps) {
  const cssColor = toCssColor(resolveValue(value, combinedTokens));

  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    const availableReferencePaths = referencePaths(combinedTokens);

    return (
      <ClickAwayListener onClickAway={() => setIsEditing(false)}>
        <TokenChipForm
          ref={isReference(value) ? value : String(value)}
          label={name}
          hex={cssColor}
          referencePaths={availableReferencePaths}
        />
      </ClickAwayListener>
    );
  }
  return (
    <div
      onClick={() => {
        setIsEditing(true);
      }}
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

      <span style={{ fontSize: 12, fontFamily: "monospace" }}>{cssColor}</span>
      {isReference(value) ? (
        <span style={{ fontSize: 12, fontFamily: "monospace" }}>{value}</span>
      ) : null}
      <span style={{ fontSize: 12, fontFamily: "monospace" }}>{name}</span>
    </div>
  );
}

const TokenChipForm = ({
  hex,
  ref,
  label,
  referencePaths,
}: {
  hex: string;
  ref: string;
  label: string;
  referencePaths: ReferencePath[];
}) => {
  const schema = z.object({
    hex: z.string(),
    ref: z.string(),
    label: z.string(),
  });
  const { register, watch, setValue } = useForm({
    defaultValues: { hex, ref, label },
    resolver: zodResolver(schema),
  });

  const refInputValue = watch("ref");
  const [isRefOpen, setIsRefOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

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
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      const active = filteredReferencePaths[clampedActiveIndex];
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
    <form
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
      <input {...register("hex")}></input>

      <div style={{ position: "relative" }}>
        <input
          {...refField}
          autoComplete="off"
          onChange={(event) => {
            onRefChange(event);
            setActiveIndex(0);
            setIsRefOpen(true);
          }}
          onFocus={() => setIsRefOpen(true)}
          onKeyDown={handleRefKeyDown}
        />
        {isRefOpen && filteredReferencePaths.length > 0 ? (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              zIndex: 1,
              margin: "4px 0 0",
              padding: 4,
              listStyle: "none",
              background: "white",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 6,
              maxHeight: 160,
              overflowY: "auto",
              minWidth: 160,
            }}
          >
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
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "4px 6px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  background:
                    index === clampedActiveIndex
                      ? "rgba(0,0,0,0.08)"
                      : "transparent",
                }}
              >
                <span>{path}</span>
                <span style={{ opacity: 0.5 }}>{type}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <input {...register("label")}></input>
    </form>
  );
};
