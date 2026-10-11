import clsx from "clsx";
import { CSSProperties } from "react";
import { JSX } from "react/jsx-runtime";
import styles from "./index.module.scss";
export type TypographyVariant =
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "button"
  | "caption"
  | "overline"
  | "inherit";

const variantMap = {
  heading1: "h1",
  heading2: "h2",
  heading3: "h3",
  heading4: "h4",
  heading5: "h5",
  heading6: "h6",
  subtitle1: "h6",
  subtitle2: "h6",
  body1: "p",
  body2: "p",
  inherit: "p",
  button: "span",
  caption: "span",
  overline: "span",
} as const satisfies Record<TypographyVariant, keyof JSX.IntrinsicElements>;

export type TypographyGutter = "none" | "xs" | "sm" | "md" | "lg";

const gutterMap = {
  heading1: "xs",
  heading2: "xs",
  heading3: "xs",
  heading4: "xs",
  heading5: "sm",
  heading6: "sm",
  subtitle1: "sm",
  subtitle2: "sm",
  body1: "md",
  body2: "md",
  inherit: "none",
  button: "none",
  caption: "none",
  overline: "sm",
} as const satisfies Record<TypographyVariant, TypographyGutter>;

type TypographyProps = {
  variant?: TypographyVariant;
  as?: keyof JSX.IntrinsicElements;
  gutter?: TypographyGutter;
  children: string;
  className?: string;
  style?: CSSProperties;
};

export const Typography = ({
  variant = "body1",
  as,
  gutter,
  children,
  className,
  style,
}: TypographyProps) => {
  const Component = as || variantMap[variant];
  const gutterClass = styles[`gutter-${gutter ?? gutterMap[variant]}`];

  return (
    <Component
      className={clsx(styles[variant], gutterClass, className)}
      style={style}
    >
      {children}
    </Component>
  );
};
