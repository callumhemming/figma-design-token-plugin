import { ReactNode } from "react";
import { TokensContextProvider } from "../Tokens/TokensContextProvider";

export const Providers = ({ children }: { children: ReactNode }) => {
  return <TokensContextProvider>{children}</TokensContextProvider>;
};
