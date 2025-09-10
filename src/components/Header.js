import React from "react";
import Logout from "./Logout";

const Header = () => {
  return (
    <div>
      <div>
        <h2>Track My Class</h2>
        <span>Track Time. Teach Smarter.</span>
      </div>

      <div>
        <Logout />
      </div>
    </div>
  );
};

export default Header;
