import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import BlogPage from './pages/BlogPage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import ProductsPage from './pages/ProductsPage';
import DashboardAppPage from './pages/DashboardAppPage';
import SlaughteringPage from './pages/SlaughteringPage';

// ----------------------------------------------------------------------

// Protected Route Component
const ProtectedRoute = ({ path, element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};



// Custom guard function
const isAuthenticated = () => {
  // Replace with your authentication logic
  // Example: Check if user is logged in or has a valid token

  const newDate = new Date()
  const token = JSON.parse(localStorage.getItem('userData'));
  const expire = new Date(token?.tokens?.access?.expires)

  if (newDate > expire){
    localStorage.removeItem('userData');
  }
  return localStorage.getItem('userData') !== null;
};


export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <ProtectedRoute element={<DashboardAppPage />} /> },
        { path: 'user', element: <ProtectedRoute element={<UserPage />} /> },
        { path: 'products', element: <ProtectedRoute element={<ProductsPage /> }/> },
        { path: 'blog', element: <ProtectedRoute element={<BlogPage />} /> },
        { path: 'slaughtering', element: <ProtectedRoute element={<SlaughteringPage />} />}
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
