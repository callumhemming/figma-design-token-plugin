import { ReactNode } from "react";
import { Breadcrumbs } from "./components/breadcrumbs/breadcrumbs";
import { EditWindow, EditWindowType } from "../edit-window";
import { SideBar } from "./components/side-bar";
import { TopBar } from "./components/top-bar";
import styles from "./layout.module.scss";

type LayoutProps = {
  children: ReactNode;
  editWindowType?: EditWindowType;
};

export const Layout = ({ children, editWindowType }: LayoutProps) => {
  return (
    <div className={styles.root}>
      <TopBar className={styles.topBar} />
      <SideBar className={styles.sideBar} />
      <Breadcrumbs className={styles.breadcrumbs} />
      <EditWindow className={styles.edit} windowType={editWindowType} />

      <main className={styles.main}>{children}</main>
    </div>
  );
};
