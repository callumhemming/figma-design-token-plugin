import clsx from "clsx";
import { ComponentPropsWithRef } from "react";
import styles from "./textarea.module.scss";

type TextareaProps = ComponentPropsWithRef<"textarea">;

export const Textarea = ({ className, ...props }: TextareaProps) => (
  <textarea className={clsx(styles.textareaRoot, className)} {...props} />
);
