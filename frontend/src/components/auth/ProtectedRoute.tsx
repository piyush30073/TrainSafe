import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Client-side route gate.
 * The backend remains the source of truth and validates every protected API request.
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
