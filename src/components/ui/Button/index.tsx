import clsx from "clsx";
import { ComponentPropsWithoutRef, ReactNode } from "react";
import { Icon, Icons, IconSize } from "../icons";
import styles from "./index.module.scss";

export type ButtonVariant = "solid" | "soft" | "outline" | "ghost";
export type ButtonColor = "primary" | "secondary" | "accent" | "neutral";
export type ButtonSize = 1 | 2 | 3;

type ButtonProps = {
  children: ReactNode;
  className?: string;
  icon?: Icons;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
} & ComponentPropsWithoutRef<"button">;

const iconSizeMap = {
  1: 5,
  2: 6,
  3: 7,
} as const satisfies Record<ButtonSize, IconSize>;

export const Button = ({
  icon,
  children,
  className,
  variant = "solid",
  color = "primary",
  size = 2,
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={clsx(
        styles.buttonRoot,
        styles[variant],
        styles[color],
        styles[`size-${size}`],
        className,
      )}
      {...props}
    >
      {icon ? <Icon size={iconSizeMap[size]} icon={icon} /> : null}
      {typeof children === "string" ? (
        <span className={styles.label}>{children}</span>
      ) : (
        children
      )}
    </button>
  );
};
