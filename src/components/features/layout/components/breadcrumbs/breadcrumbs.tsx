import clsx from "clsx";
import { Typography } from "../../../../ui/typography";
import styles from "./breadcrumbs.module.scss";

type BreadcrumbsProps = {
  className?: string;
};

export const Breadcrumbs = ({ className }: BreadcrumbsProps) => {
  return (
    <div className={clsx(className, styles.root)}>
      <Typography variant="heading6" gutter="none">
        Semantic/
      </Typography>

      <Typography bold variant="heading6" gutter="none">
        {`typography`}
      </Typography>
    </div>
  );
};
