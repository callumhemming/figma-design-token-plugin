import clsx from "clsx";
import { Button } from "../../../../ui/button";
import { Typography } from "../../../../ui/typography";
import styles from "./top-bar.module.scss";

type TopBarProps = {
  className?: string;
};

export const TopBar = ({ className }: TopBarProps) => {
  return (
    <header className={clsx(className, styles.root)}>
      <span className={styles.logoContainer}>
        <span className={styles.chip}></span>
        <Typography gutter="none" variant="heading5">
          Tokens manager
        </Typography>
      </span>
      <span className={styles.controlsContainer}>
        <Typography gutter="none">Theme</Typography>
        <Button>Light</Button>

        <Button>Dark</Button>
      </span>
    </header>
  );
};
