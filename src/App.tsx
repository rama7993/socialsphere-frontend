import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
} from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { HomePage, homePageLoader } from "./pages/home/HomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { SearchPage } from "./pages/search/SearchPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { CreatePostPage } from "./pages/posts/CreatePostPage";

import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";

import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "/",
            element: <HomePage />,
            loader: homePageLoader,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
          {
            path: "/profile/:id",
            element: <ProfilePage />,
          },
          {
            path: "/search",
            element: <SearchPage />,
          },
          {
            path: "/notifications",
            element: <NotificationsPage />,
          },
          {
            path: "/create",
            element: <CreatePostPage />,
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes);

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
