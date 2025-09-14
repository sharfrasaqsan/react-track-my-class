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
import { useAuth } from "../context/AuthContext";

/* Time helpers (Asia/Colombo) */
const TZ = "Asia/Colombo";
const fmtYMD = (d) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD
const fmtWD = (d) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long" }).format(d);

export default function Dashboard() {
  const { classes = [] } = useData();
  const { user } = useAuth();

  // Derive "today" each render
  const now = new Date();
  const todayYMD = fmtYMD(now);
  const todayWD = fmtWD(now);
  const thisMonthKey = todayYMD.slice(0, 7);

  /* ---------- Scope classes to this user ---------- */
  const userId = user?.id || null;
  const userClasses = useMemo(
    () => (classes || []).filter((c) => userId && c?.createdBy === userId),
    [classes, userId]
  );

  /* ---------- Today (from weekly schedule) ---------- */
  const todayClasses = useMemo(() => {
    return userClasses.filter((c) => {
      const active = c?.isActive ?? true;
      const sched = Array.isArray(c?.schedule) ? c.schedule : [];
      return active && sched.some((s) => s.day === todayWD);
    });
  }, [userClasses, todayWD]);

  const timeRangeForToday = (c) => {
    const s = (c?.schedule || []).find((x) => x.day === todayWD);
    return s ? `${s.startTime}–${s.endTime}` : "";
  };

  /* ---------- Completed map for today (per-user) ---------- */
  const [completedMap, setCompletedMap] = useState({});
  useEffect(() => {
    if (!userId) return;
    const q1 = query(
      collection(db, "classCompletions"),
      where("date", "==", todayYMD),
      where("createdBy", "==", userId)
    );
    const unsub = onSnapshot(q1, (snap) => {
      const map = {};
      snap.forEach((d) => (map[d.data().classId] = true));
      setCompletedMap(map);
    });
    return unsub;
  }, [todayYMD, userId]);

  const markCompleted = async (classId) => {
    if (!userId) return;
    const id = `${classId}_${todayYMD}`;
    await setDoc(
      doc(db, "classCompletions", id),
      {
        classId,
        createdBy: userId,
        date: todayYMD,
        monthKey: thisMonthKey,
        completedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  /* ---------- Monthly completions (KPI + mini chart) ---------- */
  const [monthTotal, setMonthTotal] = useState(0);
  useEffect(() => {
    if (!userId) return;
    const q2 = query(
      collection(db, "classCompletions"),
      where("monthKey", "==", thisMonthKey),
      where("createdBy", "==", userId)
    );
    const unsub = onSnapshot(q2, (snap) => setMonthTotal(snap.size));
    return unsub;
  }, [thisMonthKey, userId]);

  const [miniSeries, setMiniSeries] = useState([]);
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const series = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = fmtYMD(d).slice(0, 7);
        const q3 = query(
          collection(db, "classCompletions"),
          where("monthKey", "==", key),
          where("createdBy", "==", userId)
        );
        const count = (await getCountFromServer(q3)).data().count;
        series.push({ key, count });
      }
      setMiniSeries(series);
    })();
  }, [userId, thisMonthKey]); // update when user changes or month rolls

  const maxMini = Math.max(1, ...miniSeries.map((s) => s.count));
  const activeCount = userClasses.filter((c) => c?.isActive ?? true).length;

  /* ---------- Upcoming (next 7 days; per-user) ---------- */
  const upcoming = useMemo(() => {
    const items = [];
    if (!userId) return items;
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const ymd = fmtYMD(d);
      const wd = fmtWD(d);
      const dayItems = userClasses
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
            location: c.location || "—",
          };
        });
      if (dayItems.length) items.push({ ymd, wd, dayItems });
    }
    return items;
  }, [userClasses, now, userId]);

  /* ---------- UI ---------- */
  return (
    <section className="container py-4">
      {/* If logged out, show a friendly prompt (hooks above still ran safely) */}
      {!userId ? (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <h4 className="mb-2">Please sign in</h4>
            <p className="text-muted mb-3">Sign in to view your dashboard.</p>
            <Link to="/login" className="btn btn-primary">
              Go to login
            </Link>
          </div>
        </div>
      ) : (
        <>
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
              hint="yours"
              emoji="📘"
            />
            <KpiCard
              title="Classes next 7 days"
              value={upcoming.reduce((a, d) => a + d.dayItems.length, 0)}
              hint="from your schedule"
              emoji="⏭️"
            />
          </div>

          <div className="row g-4">
            {/* Left */}
            <div className="col-lg-7 d-flex flex-column gap-4">
              {/* Today */}
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="mb-0">Today</h5>
                    <Link
                      to="/today"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Open Today
                    </Link>
                  </div>

                  {todayClasses.length === 0 ? (
                    <div className="text-muted">
                      No classes scheduled today.
                    </div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {todayClasses.map((c) => {
                        const done = !!completedMap[c.id];
                        return (
                          <li
                            key={c.id}
                            className="list-group-item d-flex align-items-center gap-3"
                          >
                            <div className="flex-grow-1">
                              <div className="fw-semibold text-truncate">
                                {c.title || "Untitled class"}
                              </div>
                              <div className="small text-muted">
                                {timeRangeForToday(c)}
                              </div>
                              <div className="d-md-none mt-1">
                                <span className="badge rounded-pill text-bg-secondary">
                                  📍 {c.location || "—"}
                                </span>
                              </div>
                            </div>
                            <div
                              className="d-none d-md-block small text-truncate"
                              style={{ maxWidth: 220 }}
                              title={c.location}
                            >
                              <span className="badge rounded-pill text-bg-secondary">
                                📍 {c.location || "—"}
                              </span>
                            </div>
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

              {/* Upcoming */}
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
                                <span className="text-truncate">
                                  {it.title}
                                </span>
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

            {/* Right */}
            <div className="col-lg-5 d-flex flex-column gap-4">
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
                        const h = (s.count / maxMini) * 120 + 12;
                        const label = s.key.slice(2);
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

              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="mb-3">Needs attention</h5>
                  <ul className="list-group list-group-flush">
                    {userClasses.filter((c) => !(c?.isActive ?? true))
                      .length === 0 &&
                    userClasses.filter(
                      (c) =>
                        !Array.isArray(c?.schedule) || c.schedule.length === 0
                    ).length === 0 ? (
                      <li className="list-group-item text-muted">
                        All good. No issues detected.
                      </li>
                    ) : (
                      <>
                        {userClasses
                          .filter((c) => !(c?.isActive ?? true))
                          .map((c) => (
                            <li
                              key={`inactive_${c.id}`}
                              className="list-group-item d-flex justify-content-between"
                            >
                              <span>
                                Inactive:{" "}
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
                        {userClasses
                          .filter(
                            (c) =>
                              !Array.isArray(c?.schedule) ||
                              c.schedule.length === 0
                          )
                          .map((c) => (
                            <li
                              key={`nosched_${c.id}`}
                              className="list-group-item d-flex justify-content-between"
                            >
                              <span>
                                No schedule:{" "}
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
        </>
      )}
    </section>
  );
}

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
