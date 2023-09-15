import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/appContext";
import Select from "react-select";
import { roomService } from "../../services/roomService";
import { selectDataService } from "../../services/selectDataService";
import AddRoom from "../AddRoom/AddRoom";
import DeleteRoom from "../DeleteRoom/DeleteRoom";
import MergeRooms from "../MergeRooms/MergeRooms";
import { notificationService } from "../../services/notificationService";
import TabSwitch from "../TabSwitch/TabSwitch";
import "./RoomsBlock.scss";

const RoomsBlock = ({ addClasses = "" }) => {
  //#region Get room from context
  const { currentRoom, setCurrentRoom } = useContext(AppContext);
  //#endregion

  //#region Rooms
  const [rooms, setRooms] = useState([]);
  //#endregion

  //#region Get rooms list from DB
  const getRooms = async () => {
    try {
      const roomsFromDb = await roomService.getAll();

      setRooms(roomsFromDb);
    } catch (error) {
      notificationService.showError("Something went wrong");
    }
  };

  useEffect(() => {
    getRooms();
  }, []);
  //#endregion

  //#region Choose room
  const updateCurrentRoom = (id) => {
    const room = rooms.find((curRoom) => curRoom.id === id);

    setCurrentRoom(room);
  };
  //#endregion

  //#region Render
  return (
    <div className={`rooms-block ${addClasses}`}>
      <h4 className="rooms-block__item">Rooms</h4>
      <Select
        classNames={{
          control: (state) =>
            state.isFocused
              ? "rooms-block__select rooms-block__select--active rooms-block__item"
              : "rooms-block__select rooms-block__item",
        }}
        options={selectDataService.transformRoomsArrayToSelectOptions(rooms)}
        placeholder={"Choose room"}
        onChange={(event) => updateCurrentRoom(event.value)}
        value={{
          value: currentRoom?.id || null,
          label: currentRoom?.name || "Choose room",
        }}
      />
      <div className={"rooms-block__item"}>
        <TabSwitch
          text={currentRoom?.name || "Not chosen"}
          currentTab={currentRoom?.name || ""}
          name={currentRoom?.name || null}
        />
      </div>
      <h5 className="rooms-block__item">Manage rooms</h5>
      <AddRoom
        addClasses={"rooms-block__item"}
        isAdding={true}
        setRooms={setRooms}
      />

      {currentRoom && (
        <>
          <AddRoom
            addClasses={"rooms-block__item"}
            isAdding={false}
            setRooms={setRooms}
          />
          
          <DeleteRoom addClasses={"rooms-block__item"} setRooms={setRooms} />

          <MergeRooms
            addClasses={"rooms-block__item"}
            rooms={rooms}
            setRooms={setRooms}
          />
        </>
      )}
    </div>
  );
  //#endregion
};

export default RoomsBlock;
