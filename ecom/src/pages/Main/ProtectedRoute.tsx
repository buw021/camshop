import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loading } from "../../components/main/Loading";
import { useAuth } from "../../contexts/useAuth";

const ProtectedRoute: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  // Show a loading spinner while checking user session
  const { token, loading } = useAuth();
  if (loading) {
    return <Loading></Loading>;
  }

  // Redirect to "/" if no token is available
  if (!token) {
    return <Navigate to="/" />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
