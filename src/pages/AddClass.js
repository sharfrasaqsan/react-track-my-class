import React, { useState } from "react";
import ButtonLoader from "../utils/ButtonLoader";
import { toast } from "sonner";
import { db } from "../firebase/Config";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Loader from "../utils/Loader";

const AddClass = () => {
  const { user } = useAuth();
  const { setClasses, loading } = useData();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title) {
      setError("Title is required");
      return;
    }

    if (!description) {
      setError("Description is required");
      return;
    }

    if (!location) {
      setError("Location is required");
      return;
    }

    if (!capacity || isNaN(capacity)) {
      setError("Capacity must be a valid number");
      return;
    }

    if (!amount || isNaN(amount)) {
      setError("Amount must be a valid number");
      return;
    }

    if (amount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    if (capacity <= 0) {
      setError("Capacity must be greater than zero");
      return;
    }

    if (schedule.length === 0) {
      setError("Please add at least one day to the schedule.");
      return;
    }

    setAddLoading(true);
    setError(null);
    try {
      const newClass = {
        title,
        description,
        location,
        capacity: parseInt(capacity),
        schedule,
        amount: parseFloat(amount),
        isActive: true,
        instructorId: user.id,
        createdAt: new Date().toISOString(),
      };
      const res = await addDoc(collection(db, "classes"), newClass);
      setClasses((prev) => [...prev, { id: res.id, ...newClass }]);
      setTitle("");
      setDescription("");
      setLocation("");
      setCapacity(0);
      setSchedule([]);
      toast.success("Class added successfully");
      navigate("/classes");
    } catch (err) {
      console.log("Error adding class:", err.code, err.message);
      setError(err.message);
    }
    setAddLoading(false);
  };

  if (!user) return null;
  if (loading) return <Loader />;

  return (
    <section className="container py-5">
      <div className="auth-form shadow-sm p-4 rounded">
        <h2 className="text-primary mb-4 text-center">Add Tuition Class</h2>

        <form onSubmit={handleSubmit}>
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4 col-md-6">
              <div className="mb-4">
                <label htmlFor="description" className="form-label">
                  Class Description
                </label>
                <textarea
                  id="description"
                  rows="9"
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
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
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
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
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <div className="mb-3 col-md-3 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={handleAddSchedule}
                disabled={!selectedDay || !startTime || !endTime}
              >
                Add Schedule
              </button>
            </div>

            <div className="col-12">
              <ul className="list-group">
                {(schedule || [])?.map((item, index) => (
                  <li key={index} className="list-group-item">
                    {item.day}: {item.startTime} - {item.endTime}
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
                Adding Class... <ButtonLoader />
              </>
            ) : (
              "Add Class"
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddClass;
