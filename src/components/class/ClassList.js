import { useData } from "../../context/DataContext";
import ClassCard from "./ClassCard";
import NotFoundText from "../../utils/NotFoundText";
import Loader from "../../utils/Loader";

const ClassList = () => {
  const { classes, loading } = useData();

  if (loading) return <Loader />;
  if (!classes) return <NotFoundText text="No classes available." />;

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
          </tr>
        </thead>
        <tbody>
          {classes?.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClassList;
