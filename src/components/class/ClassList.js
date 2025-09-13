import { useData } from "../../context/DataContext";
import ClassCard from "./ClassCard";
import NotFoundText from "../../utils/NotFoundText";
import Loader from "../../utils/Loader";
import { useAuth } from "../../context/AuthContext";

const ClassList = () => {
  const { user } = useAuth();
  const { classes, loading } = useData();

  const userClasses = classes?.filter((cls) => cls.createdBy === user.id);

  console.log(userClasses);

  if (loading) return <Loader fullScreen />;
  if (!user) return null;
  if (classes.length === 0)
    return <NotFoundText text="No classes available right now." />;
  if (!userClasses || userClasses.length === 0)
    return <NotFoundText text="No classes available right now. Please create the first class." />;

  return (
    <div className="container table-container py-5">
      <table className="table table-bordered table-striped table-hover table-responsive">
        <thead className="thead-dark">
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Location</th>
            <th>Capacity</th>
            <th>Schedule</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userClasses?.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClassList;
