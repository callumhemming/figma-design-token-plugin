import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { Providers } from "./components/Providers/Providers";

const container = document.getElementById("root")!;
createRoot(container).render(
  <Providers>
    <App />
  </Providers>,
);
