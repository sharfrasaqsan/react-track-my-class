import React from "react";
import { Link } from "react-router-dom";
import ClassList from "../components/class/ClassList";

const Class = () => {
  return (
    <section className="container py-4">
      {/* Hero */}
      <div
        className="rounded-4 p-4 p-md-5 mb-4 text-white shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, rgba(13,110,253,1) 0%, rgba(111,66,193,1) 100%)",
        }}
      >
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
          <div>
            <h2 className="mb-1">Classes</h2>
            <div className="opacity-75 small">Manage all your classes</div>
          </div>
          <Link to="/add-class" className="btn btn-light btn-sm">
            ➕ Add Class
          </Link>
        </div>
      </div>

      {/* List container */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          <ClassList />
        </div>
      </div>
    </section>
  );
};

export default Class;
