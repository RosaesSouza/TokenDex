import React from "react";
import { Navigate } from "react-router-dom";
import { getLoggedUser } from "../services/authService";

export default function PrivateRoute({ children }) {
  const user = getLoggedUser();

  if (!user) {
    return <Navigate to="/start" replace />;
  }

  return children;
}
