import { ReactNode } from "react";
import { TokensContextProvider } from "../../features/tokens/context/TokensContextProvider";

export const Providers = ({ children }: { children: ReactNode }) => {
  return <TokensContextProvider>{children}</TokensContextProvider>;
};
