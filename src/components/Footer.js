import React from "react";

const Footer = () => {
  return (
    <footer className="bg-light text-center py-3 border-top">
      <div className="container">
        <span className="text-muted small">
          &copy; {new Date().getFullYear()} TrackMyClass — All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
