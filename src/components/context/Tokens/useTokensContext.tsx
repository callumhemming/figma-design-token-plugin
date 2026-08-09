import { useContext } from "react";
import { TokensContext } from "./TokensContextProvider";

export const useTokensContext = () => {
  const context = useContext(TokensContext);
  if (!context)
    throw new Error("useTokensContext used outside of TokensContextProvider");
  return context;
};
