import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "./Loader";

/**
 * Protected route component for admin access
 * Redirects to login if user is not authenticated or not admin
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return <Loader />;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;
