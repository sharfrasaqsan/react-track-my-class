import React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { doc, deleteDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../firebase/Config";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

const ClassCard = ({ classItem }) => {
  const { user } = useAuth();
  const { setClasses, setUsers } = useData();

  const authUser = user?.id === classItem?.createdBy;

  const handleDelete = async (classId) => {
    if (!authUser) {
      toast.warning("Only the creator of the class can delete it.");
      return;
    }
    try {
      await deleteDoc(doc(db, "classes", classId));
      setClasses((prev) => (prev ? prev.filter((c) => c.id !== classId) : []));

      await updateDoc(doc(db, "users", classItem.createdBy), {
        allClasses: arrayRemove(classId),
        updatedAt: new Date().toISOString(), // ✅ fixed typo
      });

      // keep local users in sync
      setUsers?.((prev) =>
        (prev || []).map((u) =>
          u.id === classItem.createdBy
            ? {
                ...u,
                allClasses: Array.isArray(u.allClasses)
                  ? u.allClasses.filter((id) => id !== classId)
                  : [],
              }
            : u
        )
      );

      toast.success("Class deleted successfully");
    } catch (err) {
      console.error("Error deleting class:", err);
      toast.error("Failed to delete class. Please try again.");
    }
  };

  return (
    <tr>
      <td className="fw-semibold">
        <Link to={`/classes/${classItem.id}`} className="text-decoration-none">
          {classItem.title}
        </Link>
      </td>
      <td className="text-muted">{classItem.description}</td>
      <td>{classItem.location}</td>
      <td>{classItem.capacity}</td>

      <td>
        <div className="d-flex flex-column gap-1">
          {classItem.schedule?.map((s, idx) => (
            <div key={idx} className="d-flex align-items-center gap-2">
              <span className="badge rounded-pill text-bg-secondary">
                {s.day}
              </span>
              <span className="badge text-bg-primary">
                {s.startTime} – {s.endTime}
              </span>
            </div>
          ))}
        </div>
      </td>

      <td className="text-end">
        {authUser ? (
          <>
            <Link
              to={`/classes/edit/${classItem.id}`}
              className="btn btn-primary btn-sm me-2"
            >
              Edit
            </Link>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleDelete(classItem.id)}
            >
              Delete
            </button>
          </>
        ) : (
          <span className="text-muted small">Not your class</span>
        )}
      </td>
    </tr>
  );
};

export default ClassCard;
