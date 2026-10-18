import clsx from "clsx";
import { Typography } from "../../../../ui/typography";
import styles from "./edit-window.module.scss";

type EditWindowProps = {
  className?: string;
};

export const EditWindow = ({ className }: EditWindowProps) => {
  const tags = ["Primitive", "color", "color.light.json"];

  return (
    <div className={clsx(className)}>
      <header>
        <Typography variant="heading6">p.color.slate.12</Typography>
        <div className={styles.tagsContainer}>
          {tags.map((tag) => (
            <span className={styles.tag}>
              <Typography gutter="none" variant="caption">
                {tag}
              </Typography>
            </span>
          ))}
        </div>
      </header>
      <hr></hr>
      <div>
        <span>
          <Typography variant="overline">Value</Typography>
        </span>
        <input type="color"></input>
        <Typography>Primitives hold literal values.</Typography>
      </div>
    </div>
  );
};
