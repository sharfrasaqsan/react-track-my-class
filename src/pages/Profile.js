import React from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  if (!user) return null;

  const name = user.name || user.displayName || "—";
  const email = user.email || "—";

  return (
    <section className="container py-5">
      <div className="card border-0 shadow overflow-hidden">
        <div className="w-100" />

        <div className="p-4 p-md-5">
          <div className="d-flex align-items-center flex-wrap">
            <div className="flex-grow-1 mb-3">
              <h2 className="mb-1">{name}</h2>
              <div className="text-muted">{email}</div>
            </div>
          </div>

          <hr className="my-4" />

          <div className="row g-3">
            <div className="col-md-6">
              <InfoTile label="Joined" value={formatDate(user.createdAt)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Reusable little info card */
const InfoTile = ({ label, value, mono = false }) => (
  <div className="p-3 border rounded-3 bg-light h-100">
    <div className="small text-uppercase text-muted mb-1">{label}</div>
    <div className={`fw-semibold ${mono ? "font-monospace" : ""}`}>
      {value || "—"}
    </div>
  </div>
);

/** Gracefully formats JS Date, Firestore Timestamp, or ISO string */
function formatDate(v) {
  try {
    if (!v) return "—";
    const d =
      typeof v === "object" && v?.seconds
        ? new Date(v.seconds * 1000) // Firestore Timestamp
        : new Date(v);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

/** Gets initials from a display name */
function initialsFromName(n) {
  if (!n || n === "—") return "U";
  return n
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default Profile;
