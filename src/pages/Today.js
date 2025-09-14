import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase/Config";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";
import { useData } from "../context/DataContext";

const TZ = "Asia/Colombo";
const todayYMD = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date()); // YYYY-MM-DD
const weekdayToday = () =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long" }).format(
    new Date()
  ); // Monday..Sunday

export default function TodaySimple() {
  const { classes } = useData();
  const [completedMap, setCompletedMap] = useState({});
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  const ymd = todayYMD();
  const monthKey = ymd.slice(0, 7);
  const weekday = weekdayToday();

  const todayClasses = useMemo(() => {
    return (classes || []).filter(
      (c) =>
        Array.isArray(c.schedule) && c.schedule.some((s) => s.day === weekday)
    );
  }, [classes, weekday]);

  const timeRange = (c) => {
    const s = (c.schedule || []).find((x) => x.day === weekday);
    return s ? `${s.startTime}–${s.endTime}` : "";
    // assuming one slot per day; easy to extend later
  };

  useEffect(() => {
    const q = query(
      collection(db, "classCompletions"),
      where("date", "==", ymd)
    );
    const unsub = onSnapshot(q, (snap) => {
      const map = {};
      snap.forEach((d) => (map[d.data().classId] = true));
      setCompletedMap(map);
    });
    return unsub;
  }, [ymd]);

  useEffect(() => {
    const q = query(
      collection(db, "classCompletions"),
      where("monthKey", "==", monthKey)
    );
    const unsub = onSnapshot(q, (snap) => setMonthlyTotal(snap.size));
    return unsub;
  }, [monthKey]);

  const markCompleted = async (classId) => {
    const id = `${classId}_${ymd}`;
    await setDoc(
      doc(db, "classCompletions", id),
      { classId, date: ymd, monthKey, completedAt: new Date().toISOString() },
      { merge: true }
    );
  };

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
            <h2 className="mb-1">Today</h2>
            <div className="opacity-75 small">
              {weekday} • {ymd}
            </div>
          </div>
          <div className="text-end">
            <div className="small opacity-75">Completed this month</div>
            <div className="fs-3 fw-semibold">{monthlyTotal}</div>
          </div>
        </div>
      </div>

      {/* List */}
      {todayClasses.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <div className="text-muted">No classes scheduled today.</div>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-0">
            <ul className="list-group list-group-flush">
              {todayClasses.map((c) => {
                const done = !!completedMap[c.id];
                return (
                  <li className="list-group-item d-flex align-items-center gap-3">
                    {/* left: title/time (grows) */}
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-truncate">
                        {c.title || "Untitled class"}
                      </div>
                      <div className="small text-muted">{timeRange(c)}</div>

                      {/* location under title on mobile */}
                      <div className="d-md-none mt-1">
                        <span className="badge rounded-pill text-bg-secondary">
                          📍 {c.location || "—"}
                        </span>
                      </div>
                    </div>

                    {/* location as a pill on md+ screens */}
                    <div
                      className="d-none d-md-block small text-truncate"
                      style={{ maxWidth: 220 }}
                      title={c.location}
                    >
                      <span className="badge rounded-pill text-bg-secondary">
                        📍 {c.location || "—"}
                      </span>
                    </div>

                    {/* right: action/status */}
                    <div className="ms-auto">
                      {done ? (
                        <span className="badge text-bg-success">Completed</span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => markCompleted(c.id)}
                        >
                          Mark completed
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
