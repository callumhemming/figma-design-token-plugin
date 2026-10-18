import clsx from "clsx";
import { ComponentPropsWithRef } from "react";
import styles from "./number-input.module.scss";

// Register with `valueAsNumber: true` to get a number back from the form.
type NumberInputProps = Omit<ComponentPropsWithRef<"input">, "type">;

export const NumberInput = ({ className, ...props }: NumberInputProps) => (
  <input
    type="number"
    className={clsx(styles.numberInputRoot, className)}
    {...props}
  />
);
