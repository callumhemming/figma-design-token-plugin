import clsx from "clsx";
import { ComponentPropsWithRef } from "react";
import styles from "./select.module.scss";

export type SelectOption = { value: string; label: string; disabled?: boolean };

type SelectProps = {
  options: SelectOption[];
  // Shown as a disabled, empty first option.
  placeholder?: string;
} & Omit<ComponentPropsWithRef<"select">, "children">;

export const Select = ({
  options,
  placeholder,
  className,
  ...props
}: SelectProps) => (
  <select className={clsx(styles.selectRoot, className)} {...props}>
    {placeholder ? (
      <option value="" disabled>
        {placeholder}
      </option>
    ) : null}
    {options.map(({ value, label, disabled }) => (
      <option key={value} value={value} disabled={disabled}>
        {label}
      </option>
    ))}
  </select>
);
