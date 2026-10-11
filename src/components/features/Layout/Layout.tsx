import clsx from "clsx";
import { ComponentPropsWithoutRef, ReactNode } from "react";
import { Button } from "../../ui/Button";
import { Typography } from "../../ui/Typography";
import { useTokensContext } from "../tokens/hooks/useTokensContext";
import {
  COMPOSITE_TOKEN_TYPES,
  PRIMITIVE_TOKEN_TYPES,
} from "../tokens/utils/flatten";
import styles from "./Layout.module.scss";
import { useNavContext } from "./context/NavContext";

export const Layout = ({ children }: { children: ReactNode }) => {
  const { theme, setTheme, brand, setBrand } = useTokensContext();
  return (
    <div className={styles.root}>
      <SideBar />
      <div className={styles.topBar}>
        <Button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          {`Theme: ${theme}`}
        </Button>
        <Button onClick={() => setBrand(brand === "acme" ? "globex" : "acme")}>
          {`Brand: ${brand}`}
        </Button>
      </div>

      <main className={styles.main}>{children}</main>
    </div>
  );
};

export const SideBar = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) => {
  const { slug, setSlug } = useNavContext();

  return (
    <div className={clsx(styles.sideBarRoot, className)} {...props}>
      <div className={styles.sideBarColumn}>
        <Typography variant="heading2">Primitive</Typography>
        {PRIMITIVE_TOKEN_TYPES.map((type) => (
          <Button
            key={type}
            aria-pressed={slug === type}
            className={clsx(
              styles.sideBarButton,
              slug === type && styles.sideBarButtonActive,
            )}
            onClick={() => setSlug(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      <div className={styles.sideBarColumn}>
        <Typography variant="heading2">Composite</Typography>
        {COMPOSITE_TOKEN_TYPES.map((type) => (
          <Button
            key={type}
            aria-pressed={slug === type}
            className={clsx(
              styles.sideBarButton,
              slug === type && styles.sideBarButtonActive,
            )}
            onClick={() => setSlug(type)}
          >
            {type}
          </Button>
        ))}
      </div>
      <Button
        icon="cog"
        variant="outline"
        color="secondary"
        onClick={() => setSlug("settings")}
      >
        Settings
      </Button>
    </div>
  );
};
