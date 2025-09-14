import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/Config";
import { useAuth } from "../../context/AuthContext";

const TZ = "Asia/Colombo";
const monthKeyNow = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ })
    .format(new Date()) // YYYY-MM-DD
    .slice(0, 7); // YYYY-MM

export default function ClassFeesCard({ classItem }) {
  const { user } = useAuth();
  const userId = user?.id;
  const monthKey = monthKeyNow();
  const docId = `${classItem.id}_${monthKey}`;

  const [feeDoc, setFeeDoc] = useState(null);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [ratePerStudent, setRatePerStudent] = useState(
    Number(classItem?.amount || 0)
  );
  const expected = useMemo(
    () => Number(ratePerStudent || 0) * Number(enrolledCount || 0),
    [ratePerStudent, enrolledCount]
  );
  const amountPaid = Number(feeDoc?.amountPaid || 0);
  const due = Math.max(0, expected - amountPaid);

  // Ensure the classFees doc exists (idempotent)
  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, "classFees", docId);

    const ensure = async () => {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(
          ref,
          {
            classId: classItem.id,
            createdBy: userId,
            monthKey,
            ratePerStudent: Number(classItem.amount || 0),
            enrolledCount: 0,
            expected: 0,
            amountPaid: 0,
            status: "pending", // pending | partial | paid
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    };
    ensure();

    const unsub = onSnapshot(ref, (s) => {
      const data = s.data();
      setFeeDoc(data || null);
      if (data) {
        setEnrolledCount(Number(data.enrolledCount || 0));
        setRatePerStudent(Number(data.ratePerStudent || classItem.amount || 0));
      }
    });
    return unsub;
  }, [docId, classItem.id, classItem.amount, monthKey, userId]);

  const savePlan = async () => {
    if (!userId) return;
    const ref = doc(db, "classFees", docId);
    const nextExpected =
      Number(ratePerStudent || 0) * Number(enrolledCount || 0);
    const nextStatus =
      amountPaid >= nextExpected
        ? "paid"
        : amountPaid === 0
        ? "pending"
        : "partial";
    await updateDoc(ref, {
      ratePerStudent: Number(ratePerStudent || 0),
      enrolledCount: Number(enrolledCount || 0),
      expected: nextExpected,
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  };

  const [payAmt, setPayAmt] = useState("");
  const addPayment = async () => {
    if (!userId) return;
    const amt = Number(payAmt);
    if (!amt || amt <= 0) return;
    const feesRef = doc(db, "classFees", docId);
    const paymentsRef = collection(feesRef, "payments");
    await addDoc(paymentsRef, {
      amount: amt,
      method: "cash", // change if you add options
      paidAt: serverTimestamp(),
      createdBy: userId,
    });

    const nextPaid = amountPaid + amt;
    const nextStatus =
      nextPaid >= expected ? "paid" : nextPaid === 0 ? "pending" : "partial";

    await updateDoc(feesRef, {
      amountPaid: nextPaid,
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });

    setPayAmt("");
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="card-title mb-0">Fees — {monthKey}</h5>
          <span
            className={`badge rounded-pill ${
              feeDoc?.status === "paid"
                ? "text-bg-success"
                : feeDoc?.status === "partial"
                ? "text-bg-warning"
                : "text-bg-secondary"
            }`}
          >
            {feeDoc?.status || "pending"}
          </span>
        </div>

        <div className="row g-3 align-items-end">
          <div className="col-6 col-md-4">
            <label className="form-label">Rate / student</label>
            <div className="input-group">
              <span className="input-group-text">LKR</span>
              <input
                type="number"
                className="form-control"
                value={ratePerStudent}
                onChange={(e) => setRatePerStudent(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="col-6 col-md-4">
            <label className="form-label">Enrolled</label>
            <input
              type="number"
              className="form-control"
              value={enrolledCount}
              onChange={(e) => setEnrolledCount(Number(e.target.value))}
            />
          </div>
          <div className="col-12 col-md-4 d-grid">
            <button className="btn btn-outline-primary" onClick={savePlan}>
              Save plan
            </button>
          </div>
        </div>

        <hr />

        <div className="row g-3">
          <Kpi label="Expected" value={`LKR ${expected.toLocaleString()}`} />
          <Kpi label="Collected" value={`LKR ${amountPaid.toLocaleString()}`} />
          <Kpi label="Due" value={`LKR ${due.toLocaleString()}`} />
        </div>

        <div className="mt-3 d-flex gap-2">
          <input
            type="number"
            className="form-control"
            style={{ maxWidth: 220 }}
            placeholder="Payment amount"
            value={payAmt}
            onChange={(e) => setPayAmt(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={addPayment}
            disabled={!payAmt}
          >
            Add payment
          </button>
        </div>

        <div className="text-muted small mt-2">
          Tip: set the enrolled count once per month; record payments as they
          arrive.
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="col-12 col-md-4">
      <div className="p-3 border rounded-3 bg-light h-100">
        <div className="small text-uppercase text-muted mb-1">{label}</div>
        <div className="fw-semibold">{value}</div>
      </div>
    </div>
  );
}
