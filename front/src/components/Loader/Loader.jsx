import React from "react";
import "./Loader.scss";

const Loader = () => {
  //#region Render
  return (
    <div className="loader-wrapper">
      <div className="loader">
        <img src="/logo192.png" alt={"Loader"} />
      </div>
    </div>
  );
  //#endregion
};

export default Loader;
