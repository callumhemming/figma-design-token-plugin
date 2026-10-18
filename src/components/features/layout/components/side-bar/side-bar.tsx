import { Button } from "../../../../ui/button";
import { Typography } from "../../../../ui/typography";
import styles from "./side-bar.module.scss";
const PRIMITIVE_FIELDS = [
  "color",
  "spacing",
  "typography",
  "radius",
  "border-width",
  "viewport",
] as const;

const SEMANTIC_FIELDS = [
  "color",
  "spacing",
  "typography",
  "radius",
  "border-width",
] as const;

const COMPONENT_FIELDS = ["button"] as const;

type SideBarProps = {
  className?: string;
};

export const SideBar = ({ className }: SideBarProps) => {
  const categoryLengthMap: Record<(typeof SEMANTIC_FIELDS)[number], number> = {
    color: 2,
    spacing: 3,
    typography: 54,
    radius: 200,
    "border-width": 6,
  };

  return (
    <nav className={className}>
      <section className={styles.section}>
        <Typography variant="overline">Primitives</Typography>
        <ul>
          {PRIMITIVE_FIELDS.map((field) => (
            <li className={styles.listItem}>
              <Button key={field} icon="arrow" variant="ghost">
                {field}
              </Button>

              <Typography variant="caption">
                {`(${categoryLengthMap[field]})`}
              </Typography>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <Typography variant="overline">Semantic</Typography>
        {SEMANTIC_FIELDS.map((field) => (
          <Button key={field} icon="arrow" variant="ghost">
            {field}
          </Button>
        ))}
      </section>

      <section className={styles.section}>
        <Typography variant="overline">Component</Typography>
        {COMPONENT_FIELDS.map((field) => (
          <>
            <Button key={field} icon="arrow" variant="ghost">
              {field}
            </Button>
          </>
        ))}
      </section>
    </nav>
  );
};
