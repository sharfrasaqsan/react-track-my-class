import React from "react";
import { useData } from "../context/DataContext";
import { useParams, Link } from "react-router-dom";

const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ClassPage = () => {
  const { classes } = useData();
  const { id } = useParams();

  const classItem = classes.find((item) => item.id === id);

  if (!classItem) {
    return (
      <section className="container py-5">
        <div
          className="alert alert-warning d-flex align-items-center"
          role="alert"
        >
          <div className="me-2">⚠️</div>
          <div>We couldn’t find that class.</div>
        </div>
        <Link to="/classes" className="btn btn-secondary">
          ← Back to classes
        </Link>
      </section>
    );
  }

  const schedule = Array.isArray(classItem.schedule)
    ? [...classItem.schedule].sort(
        (a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day)
      )
    : [];

  const isActive = classItem?.isActive ?? true;

  return (
    <section className="container py-5">
      {/* Top bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/classes" className="btn btn-link p-0">
          ← Back
        </Link>
        <span
          className={`badge rounded-pill ${
            isActive ? "text-bg-success" : "text-bg-secondary"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="row g-4">
        {/* Left: main details */}
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="card-title mb-2">{classItem.title}</h2>
              <p className="text-muted mb-4">{classItem.description}</p>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 border rounded-3 bg-light">
                    <div className="small text-uppercase text-muted mb-1">
                      Location
                    </div>
                    <div className="fw-semibold">
                      {classItem.location || "—"}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 border rounded-3 bg-light">
                    <div className="small text-uppercase text-muted mb-1">
                      Capacity
                    </div>
                    <div className="fw-semibold">
                      {classItem.capacity ?? "—"}{" "}
                      {typeof classItem.capacity === "number" ? "students" : ""}
                    </div>
                  </div>
                </div>
              </div>

              {classItem.createdAt && (
                <div className="mt-3 text-muted small">
                  Created on{" "}
                  {new Date(classItem.createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: schedule */}
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Schedule</h5>

              {schedule.length > 0 ? (
                <ul className="list-group list-group-flush rounded overflow-hidden">
                  {schedule.map((s, idx) => (
                    <li
                      key={`${s.day}-${idx}`}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span className="fw-semibold">{s.day}</span>
                      <span className="badge text-bg-primary">
                        {s.startTime} – {s.endTime}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted">No schedule set.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassPage;
