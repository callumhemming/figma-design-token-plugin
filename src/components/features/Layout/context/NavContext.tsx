import { createContext, ReactNode, useContext, useState } from "react";
import type { TokenType } from "../../../features/tokens/utils/flatten";

export const NavContext = createContext<{
  slug: Slug;
  setSlug: React.Dispatch<React.SetStateAction<Slug>>;
}>({});

type Slug = TokenType | "settings";

export const NavContextProvier = ({ children }: { children: ReactNode }) => {
  const [slug, setSlug] = useState<Slug>("color");
  return (
    <NavContext.Provider value={{ slug, setSlug }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNavContext = () => {
  const context = useContext(NavContext);
  if (!context)
    throw new Error("useNavContext used outside of NavContextProvier");

  return context;
};
