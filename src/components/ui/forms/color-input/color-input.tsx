import clsx from "clsx";
import { ChangeEvent, ComponentPropsWithRef, useRef, useState } from "react";
import { Button } from "../../button";
import { assignRef, setNativeValue } from "../native-value";
import styles from "./color-input.module.scss";

// Not in TypeScript's DOM lib yet; Chromium-only (so it's there in Figma).
type EyeDropperConstructor = new () => {
  open: () => Promise<{ sRGBHex: string }>;
};
const EyeDropper = (globalThis as { EyeDropper?: EyeDropperConstructor })
  .EyeDropper;

// A native colour picker with its hex value and an eyedropper beside it.
// The value is always a 7-digit lowercase hex string (#rrggbb). Props go to
// the native input, so `register` works as with any other control.
type ColorInputProps = Omit<ComponentPropsWithRef<"input">, "type">;

export const ColorInput = ({
  className,
  ref,
  onChange,
  disabled,
  ...props
}: ColorInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hex, setHex] = useState(
    String(props.value ?? props.defaultValue ?? "#000000"),
  );

  // Read the DOM value once the parent's ref has run, since react-hook-form
  // writes its default value in there. register() hands over a new ref each
  // render, so this re-runs; setHex with an unchanged value is a no-op.
  const attachRef = (el: HTMLInputElement | null) => {
    assignRef(ref, el);
    inputRef.current = el;
    if (el) setHex(el.value);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHex(event.target.value);
    onChange?.(event);
  };

  const pickFromScreen = async () => {
    const input = inputRef.current;
    if (!EyeDropper || !input) return;
    try {
      const { sRGBHex } = await new EyeDropper().open();
      setNativeValue(input, sRGBHex);
    } catch {
      // The user pressed Escape: keep the current colour.
    }
  };

  return (
    <div
      className={clsx(styles.colorInputRoot, className)}
      data-disabled={disabled || undefined}
    >
      <input
        ref={attachRef}
        type="color"
        className={styles.swatch}
        disabled={disabled}
        onChange={handleChange}
        {...props}
      />
      <span className={styles.value}>{String(props.value ?? hex)}</span>
      {EyeDropper ? (
        <Button
          variant="ghost"
          color="neutral"
          size={1}
          icon="eyedropper"
          aria-label="Pick a colour from the screen"
          className={styles.eyedropper}
          disabled={disabled}
          onClick={pickFromScreen}
        >
          {null}
        </Button>
      ) : null}
    </div>
  );
};
