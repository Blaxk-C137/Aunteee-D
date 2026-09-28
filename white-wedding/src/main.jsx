import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./theme/tailwind.css";
import "./theme/tokens.css";
import "./theme/app.css";
import "./theme/chrome.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
