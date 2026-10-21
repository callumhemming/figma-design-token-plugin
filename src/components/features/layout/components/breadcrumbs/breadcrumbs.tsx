import clsx from "clsx";
import { Button } from "../../../../ui/button";
import { Typography } from "../../../../ui/typography";
import styles from "./breadcrumbs.module.scss";

type BreadcrumbsProps = {
  className?: string;
};

export const Breadcrumbs = ({ className }: BreadcrumbsProps) => {
  return (
    <div className={clsx(className, styles.root)}>
      <span className={styles.textContainer}>
        <Typography variant="heading6" gutter="none">
          Semantic/
        </Typography>

        <Typography bold variant="heading6" gutter="none">
          {`typography`}
        </Typography>
      </span>
      <Button size={1} icon="plus">
        New style
      </Button>
    </div>
  );
};
