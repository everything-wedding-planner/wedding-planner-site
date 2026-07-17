import { createBrowserRouter } from "react-router-dom";
import App from "./views/App";
import AuthPage from "./views/AuthPage";

const FrontendRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
]);
export default FrontendRouter;
