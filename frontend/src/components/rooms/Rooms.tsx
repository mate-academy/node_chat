import { useEffect, useState, type FormEvent } from "react";
import { useSocket } from "../../hooks/use-socket.hook";
import { Link, useNavigate } from "react-router";

type Room = {
  roomId: string;
  userCount: number;
};

export const Rooms = () => {
  const socketRef = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");

  const navigate = useNavigate();

  const handleCreateRoom = (event: FormEvent) => {
    event.preventDefault();
    const socket = socketRef.current;
    if (socket && newRoomName.trim() !== "") {
      socket.emit("create-room", newRoomName);
    }
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("get-rooms");

    socket.on("rooms-list", (data) => {
      setRooms(data);
    });

    socket.on("room-created", (data) => {
      navigate(`chats/${data.roomId}`);
    });

    return () => {
      socket.off("rooms-list");
    };
  }, [socketRef]);

  return (
    <div>
      <div>
        <p>Create room:</p>
        <form onSubmit={handleCreateRoom}>
          <input
            type="text"
            placeholder="Room name"
            value={newRoomName}
            onChange={(event) => setNewRoomName(event.target.value)}
          />
          <button type="submit">Create room</button>
        </form>
      </div>
      <div>
        {rooms.map((room) => (
          <div key={room.roomId}>
            <p>Room</p>
            <p>Name: {room.roomId}</p>
            <p>Users: {room.userCount}</p>
            <Link to={`chats/${room.roomId}`}>Join</Link>
          </div>
        ))}
      </div>
    </div>
  );
};
