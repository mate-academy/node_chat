import { NavLink, useNavigate } from "react-router-dom"
import type { Room } from "../../types/Room"
import './Rooms.scss';
import { useEffect, useState } from "react";
import { checkUser, deleteRoom, joinRoom, leaveRoom, renameRoom } from "../../services/roomApi";
import { getRoomMessages } from "../../services/messageApi";
import type { Message } from "../../types/Message";

type Props = {
  room: Room;
  userId: string;
  onDelete: (roomId: string) => void;
  onUpdate: (room: Room) => void;
}

export const RoomItem: React.FC<Props> = ({ room, userId, onUpdate, onDelete }) => {
  const [input, setInput] = useState(room.name);
  const [isEditing, setIsEditing] = useState(false);
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);
  const [userInRoom, setUserInRoom] = useState(false);
  const navigate = useNavigate();

 useEffect(() => {
    async function loadRoomData() {
      if (!room?.id || !userId) return;

      try {
        const [messages, userStatus] = await Promise.all([
          getRoomMessages(room.id),
          checkUser(userId, room.id),
        ]);

        setRoomMessages(messages);
        setUserInRoom(userStatus.isInRoom);
      } catch (error) {
        console.error(error);
      }
    }

    loadRoomData();
  }, [room.id, userId]);

  const roomLastMessage = roomMessages[roomMessages.length - 1];

  async function handleSaveRename(e: React.SubmitEvent) {
    e.preventDefault();

    if (!input.trim() || input === room.name) {
      setIsEditing(false);
      return;
    }

    const updatedRoom = await renameRoom(input.trim(), room.id);

    onUpdate(updatedRoom);
    setIsEditing(false);
  }

  async function handleDelete() {
    await deleteRoom(room.id);
    onDelete(room.id);
  }

  async function handleLeave() {
    const updatedRoom = await leaveRoom(userId, room.id);
    onUpdate(updatedRoom);
    setUserInRoom(false);
    navigate('/chat');
  }

  async function handleJoin() {
    const updatedRoom = await joinRoom(userId, room.id);
    onUpdate(updatedRoom);
    setUserInRoom(true);
    navigate(`/rooms/${room.id}`);
  }

  return (
    <div className="room">
      {isEditing ? (
        <form onSubmit={handleSaveRename} className="room__renameForm">
          <input
            type="text"
            className="room__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="room__btn">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <NavLink to={`/rooms/${room.id}`}>
          <h2 className="room__name">{room.name}</h2>
          <p className="room__text">{roomLastMessage?.text || 'No messages yet'}</p>
        </NavLink>
      )}
      {!isEditing && (
        <button className="room__edit" onClick={() => setIsEditing(true)}>
          ✏️
        </button>
      )}

      <button className="room__delete" onClick={handleDelete}>❌</button>
      {userInRoom ? (
        <button className="room__leave" onClick={handleLeave}>➡️</button>
      ) : (
        <button className="room__join" onClick={handleJoin}>🚪</button>
      )}
    </div>
  )
}
