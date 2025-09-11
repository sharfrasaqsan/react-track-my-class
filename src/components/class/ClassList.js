import React from "react";
import { useData } from "../../context/DataContext";
import ClassCard from "./ClassCard";

const ClassList = () => {
  const { classes } = useData();
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
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
