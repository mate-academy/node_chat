import { useState } from "react";
import type { Room } from "../../types/room";
import './RoomItem.scss';
import { Link } from "react-router";

type Props = {
  room: Room;
  name: string;
  onDeleteRoom: (roomId: string) => void;
  onRenameRoom: (roomId: string, newRoomName: string) => void;
};

export const RoomItem = ({ room, name, onDeleteRoom, onRenameRoom }: Props) => {
  const isOwner = name === room.owner;

  const [isRenaming, setIsRenaming] = useState(false);
  const [newRoomName, setNewRoomName] = useState(room.name);

  return (
    <div className="room__item" >
      <div className="room__text">
        {isRenaming ? (
          <form className="form" onSubmit={(e) => {
            e.preventDefault();
            if (newRoomName.trim()) {
              onRenameRoom(room.roomId, newRoomName.trim());
              setIsRenaming(false);
            }
          }}>
            <input
              type="text"
              name="newRoomName"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter new room name"
            />
            <div className="form__buttons">
              <button className="form__buttons__save" type="submit">Save</button>
              <button className="form__buttons__cancel" type="button" onClick={() => {
                setNewRoomName(room.name);
                setIsRenaming(false);
              }} >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="room__text-title">{room.name}</h3>
            <p className="room__text-description">Owner: {room.owner}</p>
          </>
        )}
      </div>
      <div className="room__buttons">
        <Link to={`/rooms/${room.roomId}`} className="room__button">Join</Link>
        {isOwner && (
          <button className="room__button" onClick={() => setIsRenaming(true)}>
            Rename
          </button>
        )}
        {isOwner && (
          <button className="room__button" onClick={() => onDeleteRoom(room.roomId)}>
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
