import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { Providers } from "./components/providers";
import "./styles/tokens.css";
import "./styles/reset.scss";

const container = document.getElementById("root")!;
createRoot(container).render(
  <Providers>
    <App />
  </Providers>,
);
