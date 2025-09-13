import React from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2 className="mb-4">Profile</h2>
      <div className="card p-4 shadow-sm">
        <p>
          <strong>Name:</strong> {user.name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>
    </div>
  );
};

export default Profile;
