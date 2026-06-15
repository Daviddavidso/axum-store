import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import "@/lib/staticApi"; // installs the no-backend axios adapter when REACT_APP_STATIC_DEMO=1
import App from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
