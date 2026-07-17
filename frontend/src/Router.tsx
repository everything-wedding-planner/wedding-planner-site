import { createBrowserRouter } from "react-router-dom";
import AuthGuard from "./views/AuthGuard";
import AuthPage from "./views/AuthPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./views/DashboardHome";

const FrontendRouter = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/",
    element: <AuthGuard />,
    children: [
      {
        path: "",
        element: <DashboardLayout />,
        children: [
          {
            path: "dashboard",
            element: <DashboardHome />,
          },
          {
            index: true,
            element: <DashboardHome />,
          },
        ],
      },
    ],
  },
]);
export default FrontendRouter;
