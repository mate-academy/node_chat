import { useState, useContext } from "react";
import { AppContext } from "../../context/appContext";
import { roomService } from "../../services/roomService";
import { selectDataService } from "../../services/selectDataService";
import Select from "react-select";
import { notificationService } from "../../services/notificationService";
import "./MergeRooms.scss";

const MergeRooms = ({ addClasses = "", rooms = [], setRooms = () => {} }) => {
  //#region Get room from context
  const { currentRoom, setCurrentRoom } = useContext(AppContext);
  //#endregion

  //#region State for merging rooms
  const [isMergingRooms, setIsMergingRooms] = useState(false);
  const [absorbingRoom, setAbsorbingRoom] = useState(null);
  //#endregion

  //#region Choose to merge
  const updateAbsorbingRoom = (id) => {
    const room = rooms.find((curRoom) => curRoom.id === id);

    setAbsorbingRoom(room);
  };
  //#endregion

  //#region Merge rooms
  const mergeRooms = async (absorbedId, absorbingId) => {
    try {
      await roomService.mergeRooms(absorbedId, absorbingId);

      const updatedRooms = await roomService.getAll();
      setCurrentRoom(absorbingRoom);
      setRooms(updatedRooms);
      setIsMergingRooms(false);
      notificationService.showSuccess("Rooms have been merged");
    } catch (error) {
      notificationService.showError("Something went wrong");
    }
  };
  //#endregion

  //#region Render
  return (
    <div className={`merge-rooms ${addClasses}`}>
      {isMergingRooms ? (
        <>
          <h6 className="merge-rooms__item">{"Rooms merging"}</h6>

          <Select
            classNames={{
              control: (state) =>
                state.isFocused
                  ? "rooms-block__select--active merge-rooms__item"
                  : "rooms-block__select merge-rooms__item",
            }}
            options={selectDataService.transformRoomsArrayToSelectOptions(
              rooms.filter((room) => room.id !== currentRoom.id)
            )}
            placeholder={"Choose room"}
            onChange={(event) => updateAbsorbingRoom(event.value)}
            value={{
              value: absorbingRoom?.id || null,
              label: absorbingRoom?.name || "Choose room",
            }}
          />

          <button
            type={"button"}
            onClick={() => mergeRooms(currentRoom.id, absorbingRoom.id)}
            className={"regular-button regular-button--low merge-rooms__item"}
          >
            Save
          </button>

          <button
            type={"button"}
            onClick={() => setIsMergingRooms(false)}
            className={
              "regular-button regular-button--contrast regular-button--low merge-rooms__item"
            }
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          type={"button"}
          onClick={() => {
            setIsMergingRooms(true);
          }}
          className={"regular-button regular-button--low merge-rooms__item"}
        >
          {"Merge with"}
        </button>
      )}
    </div>
  );
  //#endregion
};

export default MergeRooms;
