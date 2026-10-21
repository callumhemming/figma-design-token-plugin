import clsx from "clsx";
import { ReactNode, useState } from "react";
import { Tag } from "../../ui/tag";
import { Typography } from "../../ui/typography";
import { ColorEdit } from "./components/color-edit";
import { ScaleEdit } from "./components/scale-edit";
import { TypographyEdit } from "./components/typography-edit";
import styles from "./edit-window.module.scss";

export type EditWindowType = "color" | "scale" | "typography";

type EditWindowProps = {
  windowType?: EditWindowType;
  className?: string;
};

// Placeholder headers until the window is driven by the selected token.
const windows: Record<
  EditWindowType,
  { title: string; tags: string[]; body: ReactNode }
> = {
  color: {
    title: "p.color.slate.12",
    tags: ["Primitive", "color", "color.light.json"],
    body: <ColorEdit />,
  },
  scale: {
    title: "p.color.slate",
    tags: ["Primitive", "scale", "color.light.json"],
    body: <ScaleEdit />,
  },
  typography: {
    title: "s.typography.heading1",
    tags: ["Semantic", "typography", "typography.json"],
    body: <TypographyEdit />,
  },
};

export const EditWindow = ({
  windowType = "color",
  className,
}: EditWindowProps) => {
  const { title, tags, body } = windows[windowType];
  const [removed, setRemoved] = useState<string[]>([]);

  return (
    <div className={clsx(className)}>
      <header>
        <Typography variant="heading6">{title}</Typography>
        <div className={styles.tagsContainer}>
          {tags
            .filter((tag) => !removed.includes(tag))
            .map((tag) => (
              <Tag
                key={tag}
                onRemove={() => setRemoved((prev) => [...prev, tag])}
              >
                {tag}
              </Tag>
            ))}
        </div>
      </header>
      <hr></hr>
      <div className={styles.inputsContainer}>{body}</div>
    </div>
  );
};
