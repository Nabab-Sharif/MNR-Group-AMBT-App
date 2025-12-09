import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerPWA } from "./lib/pwaManager.ts";

// Register PWA in production
if (import.meta.env.PROD) {
  registerPWA();
}

createRoot(document.getElementById("root")!).render(<App />);
