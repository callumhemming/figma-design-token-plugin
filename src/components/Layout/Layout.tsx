import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { useTokensContext } from "../features/tokens/hooks/useTokensContext";
import {
  COMPOSITE_TOKEN_TYPES,
  PRIMITIVE_TOKEN_TYPES,
} from "../features/tokens/utils/flatten";
import styles from "./Layout.module.scss";

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
  const { activeType, setActiveType } = useTokensContext();

  return (
    <div className={clsx(styles.sideBarRoot, className)} {...props}>
      <div className={styles.sideBarColumn}>
        <h2>Primitive</h2>
        {PRIMITIVE_TOKEN_TYPES.map((type) => (
          <button
            key={type}
            aria-pressed={activeType === type}
            className={clsx(
              styles.sideBarButton,
              activeType === type && styles.sideBarButtonActive,
            )}
            onClick={() => setActiveType(type)}
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
            aria-pressed={activeType === type}
            className={clsx(
              styles.sideBarButton,
              activeType === type && styles.sideBarButtonActive,
            )}
            onClick={() => setActiveType(type)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

const NavContext = createContext({});

const Nav = () => {
  const [openTab, setOpenTab] = useState();

  return (
    <NavContext.Provider value={{ openTab, setOpenTab }}>
      <nav className={styles.navRoot}>
        <button>Primitive</button>

        <button>Semantic</button>
      </nav>
    </NavContext.Provider>
  );
};

export const useNavContext = () => {
  const context = useContext(NavContext);
  if (!context)
    throw new Error("useNavContext used outside of NavContext.Provider");
  return context;
};
