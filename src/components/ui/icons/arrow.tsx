import type { SvgProps } from "./icons";

export const Arrow = ({ className }: SvgProps) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9 7L16 12L9 17V7Z" fill="currentColor" />
    </svg>
  );
};
