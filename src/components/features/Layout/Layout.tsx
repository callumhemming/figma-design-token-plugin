import clsx from "clsx";
import { ComponentPropsWithoutRef, ReactNode } from "react";
import { Cog } from "../../ui/icons/cog";
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
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          Theme: {theme}
        </button>
        <button onClick={() => setBrand(brand === "acme" ? "globex" : "acme")}>
          Brand: {brand}
        </button>
        <Nav />
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
        <h2>Primitive</h2>
        {PRIMITIVE_TOKEN_TYPES.map((type) => (
          <button
            key={type}
            aria-pressed={slug === type}
            className={clsx(
              styles.sideBarButton,
              slug === type && styles.sideBarButtonActive,
            )}
            onClick={() => setSlug(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className={styles.sideBarColumn}>
        <h2>Composite</h2>
        {COMPOSITE_TOKEN_TYPES.map((type) => (
          <button
            key={type}
            aria-pressed={slug === type}
            className={clsx(
              styles.sideBarButton,
              slug === type && styles.sideBarButtonActive,
            )}
            onClick={() => setSlug(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <button onClick={() => setSlug("settings")}>
        Settings
        <Cog />
      </button>
    </div>
  );
};

const Nav = () => {
  return (
    <nav className={styles.navRoot}>
      <button>Primitive</button>

      <button>Semantic</button>
    </nav>
  );
};
