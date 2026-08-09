import { ReactNode, useEffect, useRef } from "react";
import styles from "./ClickAwayListener.module.scss";

interface ClickAwayListenerProps {
  onClickAway: (event: MouseEvent | TouchEvent) => void;
  children: ReactNode;
}

function ClickAwayListener({ onClickAway, children }: ClickAwayListenerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickAway(event);
      }
    }

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClickAway]);

  return (
    <div ref={ref} className={styles.wrapper}>
      {children}
    </div>
  );
}

export default ClickAwayListener;
