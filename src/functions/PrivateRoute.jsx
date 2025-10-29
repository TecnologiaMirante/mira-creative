// src/components/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import UserContext from "../context/UserContext";
import { LoadingOverlay } from "@/components/LoadingOverlay";

export function PrivateRoute({ children }) {
  const { token, isLoading } = useContext(UserContext);

  const location = useLocation();

  if (isLoading) {
    return <LoadingOverlay message="Verificando sessão..." sucess={false} />;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
