import { Navigate } from "react-router-dom";
import { isUserAuth } from "../utils";
import type { ReactNode } from "react";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = isUserAuth();

  if (!isAuthenticated) {
    return <Navigate to={"/auth"} replace />;
  }

  return <>{children}</>;
};
