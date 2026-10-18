import { ReactNode } from "react";
import { Breadcrumbs } from "./components/breadcrumbs/breadcrumbs";
import { EditWindow } from "./components/edit-window";
import { SideBar } from "./components/side-bar";
import { TopBar } from "./components/top-bar";
import styles from "./layout.module.scss";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.root}>
      <TopBar className={styles.topBar} />
      <SideBar className={styles.sideBar} />
      <Breadcrumbs className={styles.breadcrumbs} />
      <EditWindow className={styles.edit} />

      <main className={styles.main}>{children}</main>
    </div>
  );
};
