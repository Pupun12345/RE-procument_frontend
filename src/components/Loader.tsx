import './Loader.css'

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="loader">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default Loader;