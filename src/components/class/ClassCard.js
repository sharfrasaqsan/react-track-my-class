import React from "react";
import { Link } from "react-router-dom";

const ClassCard = ({ classItem }) => {
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
        <button className="btn btn-danger btn-sm">Delete</button>
      </td>
    </tr>
  );
};

export default ClassCard;
