/// <reference lib="dom" />

import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import FrontendRouter from "./Router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={FrontendRouter} />
    </AuthProvider>
  </React.StrictMode>,
);
