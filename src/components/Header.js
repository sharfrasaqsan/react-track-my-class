import React from "react";
import Logout from "./Logout";

const Header = () => {
  return (
    <header className="bg-white py-3 border-bottom shadow-sm">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="d-flex flex-column">
          <h2 className="m-0 text-primary fw-bold">Track My Class</h2>
          <span className="text-muted small">Track time. Teach smarter.</span>
        </div>
        <Logout />
      </div>
    </header>
  );
};

export default Header;
