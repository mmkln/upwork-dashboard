import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { ROUTE_PATHS } from "../../shared/routing";

const RequireAuth: React.FC = () => {
  const { token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-body text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!token) {
    return (
      <Navigate
        to={ROUTE_PATHS.login}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default RequireAuth;
