// src/pages/Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/Config";
import {
  collection,
  query,
  where,
  onSnapshot,
  getCountFromServer,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useData } from "../context/DataContext";

/* Time helpers (Asia/Colombo) */
const TZ = "Asia/Colombo";
const fmtYMD = (d) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD
const fmtWD = (d) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long" }).format(d);

export default function Dashboard() {
  const { classes = [] } = useData();

  /* Recompute “today” each render (safer around midnight) */
  const now = new Date();
  const todayYMD = fmtYMD(now);
  const todayWD = fmtWD(now);
  const thisMonthKey = todayYMD.slice(0, 7);

  /* ---------- TODAY (from weekly schedule) ---------- */
  const todayClasses = useMemo(() => {
    return (classes || []).filter((c) => {
      const active = c?.isActive ?? true;
      const sched = Array.isArray(c?.schedule) ? c.schedule : [];
      return active && sched.some((s) => s.day === todayWD);
    });
  }, [classes, todayWD]);

  const timeRangeForToday = (c) => {
    const s = (c?.schedule || []).find((x) => x.day === todayWD);
    return s ? `${s.startTime}–${s.endTime}` : "";
  };

  /* Completed map for today */
  const [completedMap, setCompletedMap] = useState({});
  useEffect(() => {
    const q = query(
      collection(db, "classCompletions"),
      where("date", "==", todayYMD)
    );
    const unsub = onSnapshot(q, (snap) => {
      const map = {};
      snap.forEach((d) => (map[d.data().classId] = true));
      setCompletedMap(map);
    });
    return unsub;
  }, [todayYMD]);

  const markCompleted = async (classId) => {
    const id = `${classId}_${todayYMD}`;
    await setDoc(
      doc(db, "classCompletions", id),
      {
        classId,
        date: todayYMD,
        monthKey: thisMonthKey,
        completedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  /* ---------- MONTHLY COMPLETIONS (KPI + mini chart) ---------- */
  const [monthTotal, setMonthTotal] = useState(0);
  useEffect(() => {
    const q = query(
      collection(db, "classCompletions"),
      where("monthKey", "==", thisMonthKey)
    );
    const unsub = onSnapshot(q, (snap) => setMonthTotal(snap.size));
    return unsub;
  }, [thisMonthKey]);

  // last 6 months (including this one)
  const [miniSeries, setMiniSeries] = useState([]);
  useEffect(() => {
    (async () => {
      const series = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = fmtYMD(d).slice(0, 7);
        const q = query(
          collection(db, "classCompletions"),
          where("monthKey", "==", key)
        );
        const count = (await getCountFromServer(q)).data().count;
        series.push({ key, count });
      }
      setMiniSeries(series);
    })();
  }, [now]);

  const maxMini = Math.max(1, ...miniSeries.map((s) => s.count));
  const activeCount = (classes || []).filter((c) => c?.isActive ?? true).length;

  /* ---------- UPCOMING (next 7 days from schedule) ---------- */
  const upcoming = useMemo(() => {
    const items = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const ymd = fmtYMD(d);
      const wd = fmtWD(d);
      const dayItems = (classes || [])
        .filter(
          (c) =>
            (c?.isActive ?? true) &&
            Array.isArray(c?.schedule) &&
            c.schedule.some((s) => s.day === wd)
        )
        .map((c) => {
          const s = c.schedule.find((x) => x.day === wd);
          return {
            id: `${c.id}_${ymd}`,
            classId: c.id,
            title: c.title || "Untitled class",
            time: s ? `${s.startTime}–${s.endTime}` : "",
            location: c.location || "—", // 👈 include location
          };
        });
      if (dayItems.length) items.push({ ymd, wd, dayItems });
    }
    return items;
  }, [classes, now]);

  /* ---------- UI ---------- */
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
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
          <div>
            <h2 className="mb-1">Dashboard</h2>
            <div className="opacity-75">
              {todayWD}, {todayYMD}
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link to="/add-class" className="btn btn-light btn-sm">
              ➕ Add Class
            </Link>
            <Link to="/today" className="btn btn-outline-light btn-sm">
              📅 Today
            </Link>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        <KpiCard
          title="Today's sessions"
          value={todayClasses.length}
          hint="scheduled"
          emoji="🗓️"
        />
        <KpiCard
          title="Completed this month"
          value={monthTotal}
          hint={thisMonthKey}
          emoji="✅"
        />
        <KpiCard
          title="Active classes"
          value={activeCount}
          hint="currently running"
          emoji="📘"
        />
        <KpiCard
          title="Classes next 7 days"
          value={upcoming.reduce((a, d) => a + d.dayItems.length, 0)}
          hint="from schedule"
          emoji="⏭️"
        />
      </div>

      <div className="row g-4">
        {/* Left column */}
        <div className="col-lg-7 d-flex flex-column gap-4">
          {/* Today */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">Today</h5>
                <Link to="/today" className="btn btn-sm btn-outline-secondary">
                  Open Today
                </Link>
              </div>

              {todayClasses.length === 0 ? (
                <div className="text-muted">No classes scheduled today.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {todayClasses.map((c) => {
                    const done = !!completedMap[c.id];
                    return (
                      <li
                        key={c.id}
                        className="list-group-item d-flex align-items-center gap-3"
                      >
                        {/* left: title/time */}
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-truncate">
                            {c.title || "Untitled class"}
                          </div>
                          <div className="small text-muted">
                            {timeRangeForToday(c)}
                          </div>
                          {/* location on mobile */}
                          <div className="d-md-none mt-1">
                            <span className="badge rounded-pill text-bg-secondary">
                              📍 {c.location || "—"}
                            </span>
                          </div>
                        </div>

                        {/* location pill on md+ */}
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
                            <span className="badge text-bg-success">
                              Completed
                            </span>
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
              )}
            </div>
          </div>

          {/* Upcoming (7 days) */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-3">Upcoming (next 7 days)</h5>
              {upcoming.length === 0 ? (
                <div className="text-muted">
                  Nothing coming up in the next week.
                </div>
              ) : (
                <div className="vstack gap-3">
                  {upcoming.map((day) => (
                    <div key={day.ymd} className="p-3 border rounded-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-semibold">
                          {day.wd} • {day.ymd}
                        </div>
                        <span className="badge text-bg-primary">
                          {day.dayItems.length}
                        </span>
                      </div>
                      <div className="vstack gap-2">
                        {day.dayItems.map((it) => (
                          <div
                            key={it.id}
                            className="d-flex justify-content-between align-items-center small flex-wrap gap-2"
                          >
                            <span className="text-truncate">{it.title}</span>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge rounded-pill text-bg-secondary">
                                📍 {it.location}
                              </span>
                              <span className="text-muted">{it.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-lg-5 d-flex flex-column gap-4">
          {/* Monthly completions mini chart */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-3">Monthly Completions</h5>
              {miniSeries.length === 0 ? (
                <div className="text-muted">No data yet.</div>
              ) : (
                <div
                  className="d-flex align-items-end gap-3"
                  style={{ minHeight: 160 }}
                >
                  {miniSeries.map((s) => {
                    const h = (s.count / maxMini) * 120 + 12; // tiny base so zeros still visible
                    const label = s.key.slice(2); // YY-MM
                    return (
                      <div
                        key={s.key}
                        className="text-center"
                        style={{ width: 36 }}
                      >
                        <div
                          className="rounded-2"
                          style={{
                            height: h,
                            background:
                              "linear-gradient(180deg, rgba(13,110,253,0.9) 0%, rgba(111,66,193,0.9) 100%)",
                          }}
                          title={`${s.key}: ${s.count}`}
                        />
                        <div className="small text-muted mt-1">{label}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Needs attention */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-3">Needs attention</h5>
              <ul className="list-group list-group-flush">
                {classes.filter((c) => !(c?.isActive ?? true)).length === 0 &&
                classes.filter(
                  (c) => !Array.isArray(c?.schedule) || c.schedule.length === 0
                ).length === 0 ? (
                  <li className="list-group-item text-muted">
                    All good. No issues detected.
                  </li>
                ) : (
                  <>
                    {classes
                      .filter((c) => !(c?.isActive ?? true))
                      .map((c) => (
                        <li
                          key={`inactive_${c.id}`}
                          className="list-group-item d-flex justify-content-between"
                        >
                          <span>
                            Inactive class:{" "}
                            <strong>{c.title || "Untitled"}</strong>
                          </span>
                          <Link
                            to={`/classes/${c.id}`}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Review
                          </Link>
                        </li>
                      ))}
                    {classes
                      .filter(
                        (c) =>
                          !Array.isArray(c?.schedule) || c.schedule.length === 0
                      )
                      .map((c) => (
                        <li
                          key={`nosched_${c.id}`}
                          className="list-group-item d-flex justify-content-between"
                        >
                          <span>
                            No schedule set:{" "}
                            <strong>{c.title || "Untitled"}</strong>
                          </span>
                          <Link
                            to={`/edit-class/${c.id}`}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Set schedule
                          </Link>
                        </li>
                      ))}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Presentational KPI card ---------- */
function KpiCard({ title, value, hint, emoji = "" }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card shadow-sm h-100 border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">{title}</div>
            <div style={{ opacity: 0.9 }}>{emoji}</div>
          </div>
          <div className="fs-3 fw-semibold mt-1">{value ?? "—"}</div>
          {hint && <div className="small text-muted">{hint}</div>}
        </div>
      </div>
    </div>
  );
}
