import clsx from "clsx";
import { ComponentPropsWithRef } from "react";
import styles from "./checkbox.module.scss";

// Pair with <FormInput inline> to put the label beside the box.
type CheckboxProps = Omit<ComponentPropsWithRef<"input">, "type">;

export const Checkbox = ({ className, ...props }: CheckboxProps) => (
  <input
    type="checkbox"
    className={clsx(styles.checkboxRoot, className)}
    {...props}
  />
);
