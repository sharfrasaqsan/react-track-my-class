import React from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { signOut } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { auth } from "../firebase/Config";

const Logout = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      if (user) {
        await signOut(auth);
        setUser(null);
        toast.success("Logged out successfully");
        navigate("/login");
      }
    } catch (err) {
      console.log("Error logging out:", err.code, err.message);
      toast.error("Error logging out");
    }
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
