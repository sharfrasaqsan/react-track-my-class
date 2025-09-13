import React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { doc, deleteDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../firebase/Config";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import NotFoundText from "../../utils/NotFoundText";

const ClassCard = ({ classItem }) => {
  const { user } = useAuth();
  const { setClasses, setUsers } = useData();

  const handleDelete = async (classId) => {
    try {
      await deleteDoc(doc(db, "classes", classId));
      setClasses((prev) =>
        prev ? prev?.filter((classItem) => classItem.id !== classId) : []
      );

      await updateDoc(doc(db, "users", classItem.createdBy), {
        allClasses: arrayRemove(classId),
        updatedAt: new Date().toISOSting(),
      });
      setUsers((prev) => prev?.map((u) => u.id === user.id));
      toast.success("Class deleted successfully");
    } catch (err) {
      console.error("Error deleting class:", err.code, err.message);
      toast.error("Failed to delete class. Please try again.");
    }
  };

  if (classItem.length === 0) return <NotFoundText text="No Results" />;

  return (
    <tr>
      <td>
        <Link to={`/classes/${classItem.id}`}>{classItem.title}</Link>
      </td>
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
