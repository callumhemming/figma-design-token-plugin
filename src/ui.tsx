import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Providers } from "./components/context/Providers/Providers";

const container = document.getElementById("root")!;
createRoot(container).render(
  <Providers>
    <App />
  </Providers>,
);
