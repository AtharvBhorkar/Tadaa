import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Loader from "../common/Loader";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}