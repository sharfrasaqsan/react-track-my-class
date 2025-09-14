import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useNavigate, useParams } from "react-router-dom";
import ButtonLoader from "../utils/ButtonLoader";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/Config";
import Loader from "../utils/Loader";
import NotFoundText from "../utils/NotFoundText";

const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EditClass = () => {
  const { user } = useAuth();
  const { classes, setClasses, loading } = useData();

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editCapacity, setEditCapacity] = useState(0);
  const [editAmount, setEditAmount] = useState(0);
  const [editSchedule, setEditSchedule] = useState([]);
  const [editSelectedDay, setEditSelectedDay] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const classToEdit = classes?.find((cls) => cls.id === id);

  useEffect(() => {
    if (classToEdit) {
      setEditTitle(classToEdit.title);
      setEditDescription(classToEdit.description);
      setEditLocation(classToEdit.location);
      setEditCapacity(classToEdit.capacity);
      setEditAmount(classToEdit.amount);
      setEditSchedule(classToEdit.schedule || []);
      setIsActive(
        typeof classToEdit.isActive === "boolean" ? classToEdit.isActive : true
      );
    }
  }, [classToEdit]);

  const isTimeOrderValid = (start, end) => start < end;

  const handleEditAddSchedule = () => {
    if (!editSelectedDay || !editStartTime || !editEndTime)
      return setError("Please fill out all schedule fields.");
    if (!isTimeOrderValid(editStartTime, editEndTime))
      return setError("End time must be after start time.");
    if (editSchedule.some((i) => i.day === editSelectedDay))
      return setError(`Schedule for ${editSelectedDay} is already added.`);

    setEditSchedule((prev) => [
      ...prev,
      { day: editSelectedDay, startTime: editStartTime, endTime: editEndTime },
    ]);
    setEditSelectedDay("");
    setEditStartTime("");
    setEditEndTime("");
    setError(null);
  };

  const startEditingSchedule = (index) => {
    const item = editSchedule[index];
    setEditingIndex(index);
    setEditSelectedDay(item.day);
    setEditStartTime(item.startTime);
    setEditEndTime(item.endTime);
    setError(null);
  };

  const cancelEditingSchedule = () => {
    setEditingIndex(null);
    setEditSelectedDay("");
    setEditStartTime("");
    setEditEndTime("");
    setError(null);
  };

  const saveEditedSchedule = () => {
    if (!editSelectedDay || !editStartTime || !editEndTime)
      return setError("Please fill out all schedule fields.");
    if (!isTimeOrderValid(editStartTime, editEndTime))
      return setError("End time must be after start time.");
    if (
      editSchedule.some(
        (it, idx) => idx !== editingIndex && it.day === editSelectedDay
      )
    )
      return setError(`Schedule for ${editSelectedDay} already exists.`);

    setEditSchedule((prev) =>
      prev.map((it, idx) =>
        idx === editingIndex
          ? {
              day: editSelectedDay,
              startTime: editStartTime,
              endTime: editEndTime,
            }
          : it
      )
    );
    cancelEditingSchedule();
  };

  const removeScheduleItem = (index) => {
    setEditSchedule((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) cancelEditingSchedule();
  };

  const handleEditSchedule = async (classId) => {
    if (!editTitle) return setError("Title is required");
    if (!editDescription) return setError("Description is required");
    if (!editLocation) return setError("Location is required");
    if (!editCapacity || isNaN(editCapacity) || editCapacity <= 0)
      return setError("Capacity must be a valid number > 0");
    if (!editAmount || isNaN(editAmount) || editAmount <= 0)
      return setError("Amount must be a valid number > 0");
    if (editSchedule.length === 0)
      return setError("Please add at least one day to the schedule.");

    setAddLoading(true);
    setError(null);
    try {
      const updatedClass = {
        id: classId,
        title: editTitle,
        description: editDescription,
        location: editLocation,
        capacity: Number(editCapacity),
        amount: Number(editAmount),
        schedule: editSchedule,
        isActive,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, "classes", classId), updatedClass);
      setClasses((prev) =>
        prev?.map((cls) => (cls.id === classId ? updatedClass : cls))
      );
      navigate("/classes");
    } catch (err) {
      console.log("Error updating class : ", err.code, err.message);
      setError("Failed to update class");
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!user) return null;
  if (!classToEdit) return <NotFoundText text="Class not found" />;

  const sortedSchedule = [...(editSchedule || [])].sort(
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
            <h2 className="mb-1">Edit Class</h2>
            <div className="opacity-75 small">{classToEdit?.title}</div>
          </div>
          <span
            className={`badge rounded-pill ${
              isActive ? "text-bg-success" : "text-bg-secondary"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleEditSchedule(classToEdit?.id);
        }}
        className="row g-4"
      >
        {/* LEFT: basic details + status */}
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
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    id="location"
                    className="form-control"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    required
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
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    required
                  />
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
                      value={editAmount}
                      onChange={(e) => setEditAmount(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    className="form-select"
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: description */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Description</h5>
              <textarea
                className="form-control"
                rows="12"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* FULL: schedule editor */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Weekly schedule</h5>

              <div className="row g-2 align-items-end">
                <div className="col-12 col-md-3">
                  <label htmlFor="day" className="form-label">
                    Day
                  </label>
                  <select
                    id="day"
                    className="form-select"
                    value={editSelectedDay}
                    onChange={(e) => setEditSelectedDay(e.target.value)}
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
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
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
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-3 d-grid">
                  {editingIndex === null ? (
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleEditAddSchedule}
                      disabled={
                        !editSelectedDay || !editStartTime || !editEndTime
                      }
                    >
                      Add
                    </button>
                  ) : (
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-success flex-fill"
                        onClick={saveEditedSchedule}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary flex-fill"
                        onClick={cancelEditingSchedule}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
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
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            type="button"
                            onClick={() => startEditingSchedule(index)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            type="button"
                            onClick={() => removeScheduleItem(index)}
                          >
                            Delete
                          </button>
                        </div>
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
            type="submit"
            className="btn btn-primary w-100"
            disabled={addLoading}
          >
            {addLoading ? (
              <>
                Updating class… <ButtonLoader />
              </>
            ) : (
              "Update Class"
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditClass;
