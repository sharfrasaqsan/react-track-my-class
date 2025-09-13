import "../styles/utils/Loader.css";

const Loader = ({ fullScreen = false }) => {
  return (
    <div
      className={fullScreen ? "loader-wrap loader-wrap--full" : "loader-wrap"}
    >
      <div className="loader">
        <span className="loader-text">loading</span>
        <span className="load" />
      </div>
    </div>
  );
};

export default Loader;
