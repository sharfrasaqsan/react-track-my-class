import React from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/Config";

const Logout = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error("Logout Error:", err);
      toast.error("Error logging out");
    }
  };

  return (
    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
      Logout
    </button>
  );
};

export default Logout;
