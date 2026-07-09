/// <reference lib="dom" />

import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./views/App"; // Make sure the path and casing are correct
import AuthPage from "./views/AuthPage"; // Make sure the path and casing are correct
import { AuthProvider } from "./AuthProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/auth",
    element: <AuthPage />, // Replace with your AuthPage component when available
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
