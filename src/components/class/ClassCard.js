import React from "react";

const ClassCard = ({ classItem }) => {
  return (
    <tr>
      <td>{classItem.title}</td>
      <td>{classItem.description}</td>
      <td>{classItem.location}</td>
      <td>{classItem.startTime}</td>
      <td>{classItem.endTime}</td>
      <td>{classItem.capacity}</td>
    </tr>
  );
};

export default ClassCard;
