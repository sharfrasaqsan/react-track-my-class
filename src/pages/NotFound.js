import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="display-1 fw-bold text-danger">404</div>
        <h2 className="mb-2">Page Not Found</h2>
        <p className="text-muted mb-4">
          The page you’re looking for doesn’t exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
