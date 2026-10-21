import { Typography } from "../../ui/typography";
import styles from "./typography-scales.module.scss";

const typographyScales = [
  {
    demo: "Ag Heading 1",
    tokenPath: "s.typography.heading1",
    size: "step-5",
  },
  {
    demo: "Ag Heading 2",
    tokenPath: "s.typography.heading2",
    size: "step-4",
  },
  {
    demo: "Ag Heading 3",
    tokenPath: "s.typography.heading3",
    size: "step-3",
  },
  {
    demo: "Ag Heading 4",
    tokenPath: "s.typography.heading4",
    size: "step-2",
  },
  {
    demo: "The quick brown fox",
    tokenPath: "s.typography.body1",
    size: "step-0",
  },
];
export const TypographyScale = () => {
  return (
    <ul className={styles.scaleListContainer}>
      {typographyScales.map((props) => (
        <TypographyCompositeToken key={props.tokenPath} {...props} />
      ))}
    </ul>
  );
};

type ScaleProps = {
  demo: string;
  tokenPath: string;
  size: string;
};

const TypographyCompositeToken = ({ demo, tokenPath, size }: ScaleProps) => {
  return (
    <li className={styles.scaleListItem}>
      <Typography variant="overline" gutter="none">
        {demo}
      </Typography>
      <Typography variant="overline" gutter="none">
        {tokenPath}
      </Typography>
      <Typography variant="overline" gutter="none">
        {size}
      </Typography>
    </li>
  );
};
