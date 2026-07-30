import { Navigate, createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { CounterPage } from "./pages/Counter/CounterPage";
import { HomePage } from "./pages/Home/HomePage";
import { SignupPage } from "./pages/Signup/SignupPage";
import { TodosPage } from "./pages/Todos/TodosPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "counter", element: <CounterPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "todos", element: <TodosPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
