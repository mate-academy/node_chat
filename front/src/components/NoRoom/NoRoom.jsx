import "./NoRoom.scss";

const NoRoom = ({ addClasses = "" }) => {
  //#region Render
  return <div className={`no-room ${addClasses}`}>Choose room</div>;
  //#endregion
};

export default NoRoom;
