import clsx from "clsx";
import { ComponentType } from "react";
import { Arrow } from "./arrow";
import { Cog } from "./cog";
import { Eyedropper } from "./eyedropper";
import styles from "./icons.module.scss";

export type IconSize = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type IconComponentProps = {
  size?: IconSize;
  className?: string;
};

// What each SVG in iconMap receives -- sizing is applied here in Icon, so the
// SVGs only draw their shape.
export type SvgProps = { className?: string };

const iconMap = {
  arrow: Arrow,
  cog: Cog,
  eyedropper: Eyedropper,
} satisfies Record<string, ComponentType<SvgProps>>;

export type Icons = keyof typeof iconMap;

type IconProps = { icon: Icons } & IconComponentProps;

export const Icon = ({ icon, size = 4, className }: IconProps) => {
  const Component = iconMap[icon];

  return (
    <Component
      className={clsx(styles.icons, styles[`size-${size}`], className)}
    />
  );
};
