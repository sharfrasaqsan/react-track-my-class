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
  const [schedule, setSchedule] = useState({});

  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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

    if (capacity <= 0) {
      setError("Capacity must be greater than zero");
      return;
    }

    if (!schedule) {
      setError("Schedule is required");
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
      setSchedule({});
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
    <section className="container auth-form-wrapper">
      <div className="auth-form">
        <h2 className="text-primary mb-3 text-center">Add Tuition Class</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title">Class Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description">Class Description</label>
            <textarea
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="location">Class Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="capacity">Class Capacity</label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="schedule">Class Schedule (e.g., MWF 5–6 PM)</label>
            <input
              type="text"
              id="schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-danger mb-3">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary button-full"
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
