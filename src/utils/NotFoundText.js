import React from "react";

const NotFoundText = ({ text }) => {
  return (
    <div>
      <h2 className="text-center my-5" style={{ minHeight: "75vh" }}>
        {text}
      </h2>
    </div>
  );
};

export default NotFoundText;
