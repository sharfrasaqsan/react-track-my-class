import React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/Config";
import { useData } from "../../context/DataContext";

const ClassCard = ({ classItem }) => {
  const { setClasses } = useData();

  const handleDelete = async (classId) => {
    try {
      await deleteDoc(doc(db, "classes", classId));
      setClasses((prev) =>
        prev ? prev?.filter((classItem) => classItem.id !== classId) : []
      );
      toast.success("Class deleted successfully");
    } catch (err) {
      console.error("Error deleting class:", err.code, err.message);
      toast.error("Failed to delete class. Please try again.");
    }
  };

  return (
    <tr>
      <td>{classItem.title}</td>
      <td>{classItem.description}</td>
      <td>{classItem.location}</td>
      <td>{classItem.capacity}</td>
      <td>
        {classItem.schedule?.map((s, index) => (
          <div key={index}>
            <strong>{s.day}</strong>: {s.startTime} - {s.endTime}
          </div>
        ))}
      </td>
      <td>
        <Link
          to={`/classes/edit/${classItem.id}`}
          className="btn btn-primary btn-sm me-2"
        >
          Edit
        </Link>

        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(classItem.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default ClassCard;
