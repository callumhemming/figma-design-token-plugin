import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { useTokensContext } from "../features/tokens/hooks/useTokensContext";
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
  return (
    <div className={clsx(styles.sideBarRoot, className)} {...props}>
      <button>Noop</button>
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
