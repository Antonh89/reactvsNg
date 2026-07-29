import { Navigate, createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/Home/HomePage';
import { CounterPage } from './pages/Counter/CounterPage';
import { TodosPage } from './pages/Todos/TodosPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'counter', element: <CounterPage /> },
      { path: 'todos', element: <TodosPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
