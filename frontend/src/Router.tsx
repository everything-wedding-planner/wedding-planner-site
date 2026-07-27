import { createBrowserRouter } from "react-router-dom";
import AuthGuard from "./views/AuthGuard";
import AuthPage from "./views/AuthPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./views/DashboardHome";
import CompanyPage from "./views/CompanyPage";
import VenueManagementPage from "./views/VenueManagementPage";
import VenueDetailPage from "./views/VenueDetailPage";
import VendorManagementPage from "./views/VendorManagementPage";
import VendorDetailPage from "./views/VendorDetailPage";
import OnboardingPage from "./views/OnboardingPage";

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
            path: "company",
            element: <CompanyPage />,
          },
          {
            path: "venues",
            element: <VenueManagementPage />,
          },
          {
            path: "venues/:id",
            element: <VenueDetailPage />,
          },
          {
            path: "vendors",
            element: <VendorManagementPage />,
          },
          {
            path: "vendors/:id",
            element: <VendorDetailPage />,
          },
          {
            index: true,
            element: <DashboardHome />,
          },
        ],
      },
      {
        path: "/onboarding",
        element: <OnboardingPage />,
      },
    ],
  },
]);
export default FrontendRouter;
