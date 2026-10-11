import { ComponentType } from "react";
import { Cog } from "./cog";

export type IconSize = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type IconComponentProps = {
  size?: IconSize;
  className?: string;
};

const iconMap = {
  cog: Cog,
} satisfies Record<string, ComponentType<IconComponentProps>>;

export type Icons = keyof typeof iconMap;

type IconProps = { icon: Icons } & IconComponentProps;

export const Icon = ({ icon, ...props }: IconProps) => {
  const Component = iconMap[icon];

  return <Component {...props} />;
};
