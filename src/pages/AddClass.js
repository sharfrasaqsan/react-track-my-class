import React, { useState } from "react";
import ButtonLoader from "../utils/ButtonLoader";
import { toast } from "sonner";
import { db } from "../firebase/Config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Loader from "../utils/Loader";

const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const AddClass = () => {
  const { user } = useAuth();
  const { setClasses, setUsers, loading } = useData();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [amount, setAmount] = useState(0);
  const [schedule, setSchedule] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleAddSchedule = () => {
    if (!selectedDay || !startTime || !endTime) {
      setError("Please fill out all schedule fields.");
      return;
    }
    if (startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }
    if (schedule.some((item) => item.day === selectedDay)) {
      setError(`Schedule for ${selectedDay} is already added.`);
      return;
    }
    setSchedule([...schedule, { day: selectedDay, startTime, endTime }]);
    setSelectedDay("");
    setStartTime("");
    setEndTime("");
    setError(null);
  };

  const removeScheduleItem = (index) => {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title) return setError("Title is required");
    if (!description) return setError("Description is required");
    if (!location) return setError("Location is required");
    if (!capacity || isNaN(capacity) || capacity <= 0)
      return setError("Capacity must be a valid number > 0");
    if (!amount || isNaN(amount) || amount <= 0)
      return setError("Amount must be a valid number > 0");
    if (schedule.length === 0)
      return setError("Please add at least one day to the schedule.");

    setAddLoading(true);
    setError(null);
    try {
      const newClass = {
        title,
        description,
        location,
        capacity: Number(capacity),
        schedule,
        amount: Number(amount),
        isActive: true,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      };
      const res = await addDoc(collection(db, "classes"), newClass);
      setClasses((prev) => [...(prev || []), { id: res.id, ...newClass }]);

      await updateDoc(
        doc(db, "users", user.id),
        { allClasses: arrayUnion(res.id), updatedAt: new Date().toISOString() },
        { merge: true }
      );
      // keep local users in sync (no-op if your UI doesn't depend on it)
      setUsers?.((prev) =>
        (prev || []).map((u) =>
          u.id === user.id
            ? {
                ...u,
                allClasses: Array.isArray(u.allClasses)
                  ? [...u.allClasses, res.id]
                  : [res.id],
              }
            : u
        )
      );

      setTitle("");
      setDescription("");
      setLocation("");
      setCapacity(0);
      setAmount(0);
      setSchedule([]);

      toast.success("Class added successfully");
      navigate("/classes");
    } catch (err) {
      console.log("Error adding class:", err.code, err.message);
      setError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  if (!user) return null;
  if (loading) return <Loader />;

  const sortedSchedule = [...schedule].sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day)
  );

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
            <h2 className="mb-1">Add Class</h2>
            <div className="opacity-75 small">
              Create a class and set its weekly schedule
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="row g-4">
        {/* LEFT: basic details */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Basic details</h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="title" className="form-label">
                    Class title
                  </label>
                  <input
                    id="title"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    id="location"
                    className="form-control"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="capacity" className="form-label">
                    Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    className="form-control"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                  />
                  <div className="form-text">Number of students</div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="amount" className="form-label">
                    Amount per student (LKR)
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      id="amount"
                      className="form-control"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows="4"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: schedule */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Weekly schedule</h5>

              <div className="row g-2 align-items-end">
                <div className="col-12 col-md-4">
                  <label htmlFor="day" className="form-label">
                    Day
                  </label>
                  <select
                    id="day"
                    className="form-select"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    <option value="" disabled>
                      Select day
                    </option>
                    {WEEKDAY_ORDER.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <label htmlFor="startTime" className="form-label">
                    Start
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    className="form-control"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label htmlFor="endTime" className="form-label">
                    End
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    className="form-control"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-1 d-grid">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleAddSchedule}
                    disabled={!selectedDay || !startTime || !endTime}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="mt-3">
                {sortedSchedule.length === 0 ? (
                  <div className="text-muted small">No days added yet.</div>
                ) : (
                  <ul className="list-group list-group-flush rounded overflow-hidden">
                    {sortedSchedule.map((item, index) => (
                      <li
                        key={`${item.day}-${index}`}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge rounded-pill text-bg-secondary">
                            {item.day}
                          </span>
                          <span className="badge text-bg-primary">
                            {item.startTime} – {item.endTime}
                          </span>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          type="button"
                          onClick={() => removeScheduleItem(index)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* footer actions */}
        <div className="col-12">
          {error && <div className="alert alert-danger mb-3">{error}</div>}
          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={addLoading}
          >
            {addLoading ? (
              <>
                Adding Class… <ButtonLoader />
              </>
            ) : (
              "Add Class"
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AddClass;
