import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // Check if the device has a saved token
  const token = localStorage.getItem('token');
  
  // If token exists, render the child routes (<Outlet />). Otherwise, redirect to /login.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}