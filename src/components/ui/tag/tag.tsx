import clsx from "clsx";
import { Icon } from "../icons";
import { Typography } from "../typography";
import styles from "./tag.module.scss";

type TagProps = {
  children: string;
  // Shows a cross that removes the tag. Only the cross is a button; the
  // label stays plain text.
  onRemove?: () => void;
  className?: string;
};

export const Tag = ({ children, onRemove, className }: TagProps) => (
  <span className={clsx(styles.tagRoot, className)}>
    <Typography gutter="none" variant="caption">
      {children}
    </Typography>
    {onRemove ? (
      <button
        type="button"
        className={styles.remove}
        aria-label={`Remove ${children}`}
        onClick={onRemove}
      >
        <Icon icon="cross" size={3} />
      </button>
    ) : null}
  </span>
);
