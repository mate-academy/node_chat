import { useContext } from "react";
import { AppContext } from "../../context/appContext";
import { roomService } from "../../services/roomService";
import { notificationService } from "../../services/notificationService";

const AddRoom = ({ addClasses = "", setRooms = () => {} }) => {
  //#region Get room from context
  const { currentRoom, setCurrentRoom } = useContext(AppContext);
  //#endregion

  //#region Delete room
  const deleteRoom = async (name) => {
    try {
      await roomService.deleteRoom(name);

      setRooms((state) => state.filter((room) => room.id !== currentRoom.id));
      setCurrentRoom(null);
      notificationService.showSuccess("Room has been deleted");
    } catch (error) {
      notificationService.showError("Something went wrong");
    }
  };
  //#endregion

  //#region Render
  return (
    <div className={`delete-room ${addClasses}`}>
      <button
        type={"button"}
        onClick={() => deleteRoom(currentRoom.id)}
        className={
          "regular-button regular-button--contrast regular-button--low"
        }
      >
        Delete room
      </button>
    </div>
  );
  //#endregion
};

export default AddRoom;
