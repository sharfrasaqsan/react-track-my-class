import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ chilren }) => {
  const { user } = useAuth();

  if (!user) {
    <Navigate to="/login" replace />;
  }

  return chilren;
};

export default ProtectedRoute;
