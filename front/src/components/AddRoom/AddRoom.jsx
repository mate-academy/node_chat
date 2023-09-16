import { useState, useContext } from "react";
import { AppContext } from "../../context/appContext";
import { roomService } from "../../services/roomService";
import { notificationService } from "../../services/notificationService";
import "./AddRoom.scss";

const AddRoom = ({ addClasses = "", setRooms = () => {}, isAdding = true }) => {
  //#region Get room from context
  const { currentRoom, setCurrentRoom } = useContext(AppContext);
  //#endregion

  //#region Add new room
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState(null);
  //#endregion

  //#region Create room
  const createRoom = async (name) => {
    try {
      if (!name) {
        notificationService.showError("Name shouldn't be empty");

        return;
      }

      const roomFromDb = await roomService.createRoom(name);

      setCurrentRoom(roomFromDb);
      setRooms((state) => [...state, roomFromDb]);
      setIsAddingRoom(false);

      notificationService.showSuccess("Room has been created");
    } catch (error) {
      notificationService.showError("Something went wrong");
    }
  };
  //#endregion

  //#region Change room name
  const changeRoomName = async (newName) => {
    try {
      if (!newName) {
        notificationService.showError("Name shouldn't be empty");

        return;
      }

      await roomService.renameRoom(currentRoom.id, newName);

      const newRoom = await roomService.getRoomById(currentRoom.id);

      setCurrentRoom(newRoom);
      setRooms((state) =>
        state.map((room) => (room.id === newRoom.id ? newRoom : room))
      );
      setIsAddingRoom(false);
      notificationService.showSuccess("Room name has been changed");
    } catch (error) {
      notificationService.showError("Something went wrong");
    }
  };
  //#endregion

  //#region Render
  return (
    <div className={`add-room ${addClasses}`}>
      {isAddingRoom ? (
        <>
          <h6 className="add-room__item">
            {isAdding ? "Room adding" : "Renaming"}
          </h6>
          <input
            type={"text"}
            placeholder={"Room name"}
            onChange={(event) => setNewRoom(event.target.value)}
            className={
              "regular-form-control regular-form-control--low add-room__item"
            }
          />

          <button
            type={"button"}
            onClick={() =>
              isAdding ? createRoom(newRoom) : changeRoomName(newRoom)
            }
            className={"regular-button regular-button--low add-room__item"}
          >
            Save room
          </button>

          <button
            type={"button"}
            onClick={() => {
              setIsAddingRoom(false);
            }}
            className={
              "regular-button regular-button--contrast regular-button--low add-room__item"
            }
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          type={"button"}
          onClick={() => {
            setIsAddingRoom(true);
          }}
          className={"regular-button regular-button--low add-room__item"}
        >
          {isAdding ? "Add room" : "Change name"}
        </button>
      )}
    </div>
  );
  //#endregion
};

export default AddRoom;
