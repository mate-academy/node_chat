import { FC } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

type PrivateRouteProps = {
  children: React.ReactNode;
};

export const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const { userName } = useUser();

  if (!userName) {
    return <Navigate to="/login" />;
  }

  return children;
};
