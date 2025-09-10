import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  return (
    <div>
      <ul>
        <li>
          <NavLink to="/">Dashboard</NavLink>
        </li>

        {!user && (
          <>
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>

            <li>
              <NavLink to="/register">Register</NavLink>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
