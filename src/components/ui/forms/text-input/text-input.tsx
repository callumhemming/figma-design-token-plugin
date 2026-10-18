import clsx from "clsx";
import { ComponentPropsWithRef } from "react";
import styles from "./text-input.module.scss";

type TextInputProps = {
  type?: "text" | "email" | "password" | "search" | "tel" | "url";
} & Omit<ComponentPropsWithRef<"input">, "type">;

export const TextInput = ({
  type = "text",
  className,
  ...props
}: TextInputProps) => (
  <input
    type={type}
    className={clsx(styles.textInputRoot, className)}
    {...props}
  />
);
