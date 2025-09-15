import React, { useEffect, useMemo, useState } from "react";
import { useData } from "../context/DataContext";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase/Config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import ClassFeesCard from "../components/class/ClassFeedCard";

const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* ---------- Month helpers ---------- */
const toMonthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const toMonthKeyFromAny = (v) => {
  if (!v) return null;
  let d;
  if (typeof v === "object" && v?.seconds)
    d = new Date(v.seconds * 1000); // Firestore Timestamp
  else d = new Date(v);
  return isNaN(d) ? null : toMonthKey(d);
};

const monthLabel = (key) => {
  if (!key) return "";
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
};

const monthKeysBetween = (startKey, endKey, cap = 12) => {
  const [sy, sm] = startKey.split("-").map(Number);
  const [ey, em] = endKey.split("-").map(Number);
  const start = new Date(sy, sm - 1, 1);
  const end = new Date(ey, em - 1, 1);
  const keys = [];
  let d = new Date(start);
  while (d <= end) {
    keys.push(toMonthKey(d));
    d.setMonth(d.getMonth() + 1);
  }
  return keys.length > cap ? keys.slice(-cap) : keys;
};

const InfoTile = ({ label, value }) => (
  <div className="col-md-6">
    <div className="p-3 border rounded-3 bg-light h-100">
      <div className="small text-uppercase text-muted mb-1">{label}</div>
      <div className="fw-semibold">{value || "—"}</div>
    </div>
  </div>
);

export default function ClassPage() {
  const { classes } = useData();
  const { id } = useParams();

  // ✅ HOOKS FIRST (always run)
  const [monthCounts, setMonthCounts] = useState({});
  useEffect(() => {
    if (!id) return; // guard inside the effect, not around the hook
    const q = query(
      collection(db, "classCompletions"),
      where("classId", "==", id)
    );
    const unsub = onSnapshot(q, (snap) => {
      const counts = {};
      snap.forEach((d) => {
        const data = d.data();
        const key = data?.monthKey || (data?.date || "").slice(0, 7);
        if (key) counts[key] = (counts[key] || 0) + 1;
      });
      setMonthCounts(counts);
    });
    return unsub;
  }, [id]);

  const classItem = useMemo(
    () => (classes || []).find((item) => item.id === id),
    [classes, id]
  );

  const isActive = classItem?.isActive ?? true;

  const schedule = useMemo(() => {
    const s = classItem?.schedule;
    return Array.isArray(s)
      ? [...s].sort(
          (a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day)
        )
      : [];
  }, [classItem]);

  // Build month series from class start -> now (max 12)
  const createdKey = toMonthKeyFromAny(classItem?.createdAt);
  const earliestCompletionKey = Object.keys(monthCounts).sort()[0] || null;
  const startKey =
    createdKey || earliestCompletionKey || toMonthKey(new Date());
  const endKey = toMonthKey(new Date());
  const keys = monthKeysBetween(startKey, endKey, 12);

  const series = useMemo(
    () => keys.map((k) => ({ key: k, count: monthCounts[k] || 0 })),
    [keys, monthCounts]
  );
  const maxVal = Math.max(1, ...series.map((s) => s.count));

  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const completedThisMonth = monthCounts[thisMonthKey] || 0;

  // ✅ Early returns AFTER hooks are declared
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
            <h2 className="mb-1">{classItem.title}</h2>
            <div className="opacity-75 small">
              <Link
                to="/classes"
                className="text-white text-decoration-underline"
              >
                ← Back
              </Link>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span
              className={`badge rounded-pill ${
                isActive ? "text-bg-success" : "text-bg-secondary"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
            <span className="badge rounded-pill text-bg-light text-dark">
              ✅ {completedThisMonth} this month
            </span>
            <Link
              to={`/classes/edit/${classItem.id}`}
              className="btn btn-light btn-sm"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Top: details + schedule */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body">
              {classItem.description && (
                <p className="text-muted mb-4">{classItem.description}</p>
              )}
              <div className="row g-3">
                <InfoTile label="Location" value={classItem.location} />
                <InfoTile
                  label="Capacity"
                  value={
                    typeof classItem.capacity === "number"
                      ? `${classItem.capacity} students`
                      : "—"
                  }
                />
                <InfoTile
                  label="Amount per student"
                  value={
                    typeof classItem.amount === "number"
                      ? `LKR ${classItem.amount}`
                      : "—"
                  }
                />
                <InfoTile
                  label="Monthly Revenue Potential"
                  value={
                    typeof classItem.amount === "number" &&
                    typeof classItem.capacity === "number"
                      ? `LKR ${classItem.amount * classItem.capacity}`
                      : "—"
                  }
                />
              </div>

              {classItem.createdAt && (
                <div className="mt-3 text-muted small">
                  Created on{" "}
                  {new Date(
                    typeof classItem.createdAt === "object" &&
                    classItem.createdAt?.seconds
                      ? classItem.createdAt.seconds * 1000
                      : classItem.createdAt
                  ).toLocaleString(undefined, {
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

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 h-100">
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

      {/* Fees for this month */}
      <div className="row g-4 mt-1">
        <div className="col-12">
          <ClassFeesCard classItem={classItem} />
        </div>
      </div>

      {/* Bottom: Completed by Month */}
      <div className="row g-4 mt-1">
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="card-title mb-0">Completed by Month</h5>
                <span className="small text-muted">
                  {keys.length} month{keys.length !== 1 ? "s" : ""} • starting{" "}
                  {monthLabel(keys[0])}
                </span>
              </div>

              {series.every((s) => s.count === 0) ? (
                <div className="text-muted">No completions recorded yet.</div>
              ) : (
                <>
                  <div
                    className="d-flex align-items-end gap-3"
                    style={{ minHeight: 160 }}
                  >
                    {series.map((s) => {
                      const h = (s.count / maxVal) * 120 + 10; // keep your old look
                      return (
                        <div
                          key={s.key}
                          className="text-center"
                          style={{ width: 40 }}
                        >
                          <div
                            className="rounded-2"
                            style={{
                              height: h,
                              background:
                                "linear-gradient(180deg, rgba(13,110,253,0.9) 0%, rgba(111,66,193,0.9) 100%)",
                            }}
                            title={`${monthLabel(s.key)}: ${s.count}`}
                          />
                          <div className="small text-muted mt-1">
                            {monthLabel(s.key)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="table-responsive mt-3">
                    <table className="table table-sm align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Month</th>
                          <th className="text-end">Completed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {series.map((s) => (
                          <tr key={`row_${s.key}`}>
                            <td>{monthLabel(s.key)}</td>
                            <td className="text-end">{s.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
