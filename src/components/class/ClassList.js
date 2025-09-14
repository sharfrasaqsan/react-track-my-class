import { useData } from "../../context/DataContext";
import ClassCard from "./ClassCard";
import NotFoundText from "../../utils/NotFoundText";
import Loader from "../../utils/Loader";
import { useAuth } from "../../context/AuthContext";

const ClassList = () => {
  const { user } = useAuth();
  const { classes = [], loading } = useData();

  const userClasses = classes?.filter((cls) => cls.createdBy === user?.id);

  if (loading) return <Loader />;
  if (!user) return null;
  if (!userClasses || userClasses.length === 0)
    return <NotFoundText text="No classes yet. Create your first one!" />;

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th style={{ minWidth: 180 }}>Title</th>
            <th style={{ minWidth: 220 }}>Description</th>
            <th>Location</th>
            <th>Capacity</th>
            <th style={{ minWidth: 220 }}>Schedule</th>
            <th className="text-end" style={{ width: 160 }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {userClasses.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClassList;
