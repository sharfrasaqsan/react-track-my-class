import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useNavigate, useParams } from "react-router-dom";
import ButtonLoader from "../utils/ButtonLoader";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/Config";
import Loader from "../utils/Loader";
import NotFoundText from "../utils/NotFoundText";

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

  // Validate end > start
  const isTimeOrderValid = (start, end) => {
    // strings "HH:MM" compare lexicographically OK for 24h time
    return start < end;
  };

  const handleEditAddSchedule = () => {
    if (!editSelectedDay || !editStartTime || !editEndTime) {
      setError("Please fill out all schedule fields.");
      return;
    }
    if (!isTimeOrderValid(editStartTime, editEndTime)) {
      setError("End time must be after start time.");
      return;
    }
    // prevent duplicate day
    if (editSchedule.some((item) => item.day === editSelectedDay)) {
      setError(`Schedule for ${editSelectedDay} is already added.`);
      return;
    }

    setEditSchedule([
      ...editSchedule,
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
    if (!editSelectedDay || !editStartTime || !editEndTime) {
      setError("Please fill out all schedule fields.");
      return;
    }
    if (!isTimeOrderValid(editStartTime, editEndTime)) {
      setError("End time must be after start time.");
      return;
    }
    // Disallow changing to a day that already exists (other than the one we're editing)
    if (
      editSchedule.some(
        (item, idx) => idx !== editingIndex && item.day === editSelectedDay
      )
    ) {
      setError(`Schedule for ${editSelectedDay} already exists.`);
      return;
    }

    setEditSchedule((prev) =>
      prev.map((item, idx) =>
        idx === editingIndex
          ? {
              day: editSelectedDay,
              startTime: editStartTime,
              endTime: editEndTime,
            }
          : item
      )
    );

    setEditingIndex(null);
    setEditSelectedDay("");
    setEditStartTime("");
    setEditEndTime("");
    setError(null);
  };

  const removeScheduleItem = (index) => {
    setEditSchedule((prev) => prev.filter((_, idx) => idx !== index));
    // if you delete the one you were editing, reset edit state
    if (editingIndex === index) {
      cancelEditingSchedule();
    }
  };

  const handleEditSchedule = async (classId) => {
    if (!editTitle) {
      setError("Title is required");
      return;
    }

    if (!editDescription) {
      setError("Description is required");
      return;
    }

    if (!editLocation) {
      setError("Location is required");
      return;
    }

    if (!editCapacity || isNaN(editCapacity)) {
      setError("Capacity must be a valid number");
      return;
    }

    if (!editAmount || isNaN(editAmount)) {
      setError("Amount must be a valid number");
      return;
    }

    if (editAmount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    if (editCapacity <= 0) {
      setError("Capacity must be greater than zero");
      return;
    }

    if (editSchedule.length === 0) {
      setError("Please add at least one day to the schedule.");
      return;
    }

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

  if (loading) {
    return <Loader />;
  }

  if (!user) return null;
  if (!classToEdit) return <NotFoundText text="Class not found" />;

  return (
    <section className="container py-5">
      <div className="auth-form shadow-sm p-4 rounded">
        <h2 className="text-primary mb-4 text-center">Edit Tuition Class</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEditSchedule(classToEdit?.id);
          }}
        >
          <div className="row">
            <div className="mb-4 col-md-6">
              <div className="mb-4">
                <label htmlFor="title" className="form-label">
                  Class Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="location" className="form-label">
                  Class Location
                </label>
                <input
                  type="text"
                  id="location"
                  className="form-control"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="capacity" className="form-label">
                  Class Capacity
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

              <div className="mb-4">
                <label htmlFor="amount" className="form-label">
                  Amount per student
                </label>
                <input
                  type="number"
                  id="amount"
                  className="form-control"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="mb-3">
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

            <div className="mb-4 col-md-6">
              <div>
                <label htmlFor="description" className="form-label">
                  Class Description
                </label>
                <textarea
                  id="description"
                  rows="13"
                  className="form-control"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <div className="row p-3 mb-4 border rounded">
            <div className="mb-3 col-md-3">
              <label htmlFor="day" className="form-label">
                Select Day
              </label>
              <select
                id="day"
                className="form-select"
                value={editSelectedDay}
                onChange={(e) => setEditSelectedDay(e.target.value)}
                // when editing, you can allow changing the day; duplicate prevention happens above
              >
                <option value="" disabled>
                  Select Day
                </option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div className="mb-3 col-md-3">
              <label htmlFor="startTime" className="form-label">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                className="form-control"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
              />
            </div>

            <div className="mb-3 col-md-3">
              <label htmlFor="endTime" className="form-label">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                className="form-control"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
              />
            </div>

            <div className="mb-3 col-md-3 d-flex align-items-end">
              {editingIndex === null ? (
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={handleEditAddSchedule}
                  disabled={!editSelectedDay || !editStartTime || !editEndTime}
                >
                  Add Schedule
                </button>
              ) : (
                <div className="d-flex gap-2 w-100">
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

            <div className="col-12">
              <ul className="list-group">
                {editSchedule?.map((item, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{item.day}</strong>: {item.startTime} -{" "}
                      {item.endTime}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => startEditingSchedule(index)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeScheduleItem(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {error && <p className="text-danger mb-3">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={addLoading}
          >
            {addLoading ? (
              <>
                Updating class... <ButtonLoader />
              </>
            ) : (
              "Update Class"
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditClass;
