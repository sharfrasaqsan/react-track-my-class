import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{ minHeight: "80vh" }}
    >
      <h1 style={{ fontSize: "6rem", color: "var(--color-danger)" }}>404</h1>
      <h2 className="mb-3" style={{ color: "var(--color-text)" }}>
        Page Not Found
      </h2>
      <p className="text-muted mb-4">
        The page you’re looking for doesn’t exist.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
