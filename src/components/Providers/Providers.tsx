import { ReactNode } from "react";
import { NavContextProvier } from "../features/Layout/context/NavContext";
import { TokensContextProvider } from "../features/tokens/context/TokensContextProvider";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <NavContextProvier>
      <TokensContextProvider>{children}</TokensContextProvider>
    </NavContextProvier>
  );
};
