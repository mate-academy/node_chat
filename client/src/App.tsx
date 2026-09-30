import { useEffect, useState } from "react";
import { socket } from "./socket";
import { Login } from "./components/Login";
import type { Room } from "./types/Room";
import type { Message } from "./types/Message";
import { RoomList } from "./components/RoomList";
import { Chat } from "./components/Chat";

const DEFAULT_ROOM_ID = "1";

function App() {
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem("username"),
  );
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogin(name: string) {
    localStorage.setItem("username", name);
    setUsername(name);
  }

  function handleLogout() {
    localStorage.removeItem("username");
    setRooms([]);
    setMessages([]);
    setCurrentRoomId(null);
    setUsername(null);
  }

  useEffect(() => {
    if (!username) return;

    const onConnect = () => {
      setConnected(true);
      socket.emit("login", username);
      socket.emit("room:join", DEFAULT_ROOM_ID);
    };
    const onDisconnect = () => setConnected(false);
    const onRooms = (list: Room[]) => setRooms(list);
    const onHistory = ({
      room,
      messages,
    }: {
      room: Room;
      messages: Message[];
    }) => {
      setCurrentRoomId(room.id);
      setMessages(messages);
    };
    const onNewMessage = (msg: Message) =>
      setMessages((prev) => [...prev, msg]);
    const onRoomDeleted = () => socket.emit("room:join", DEFAULT_ROOM_ID);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("rooms:list", onRooms);
    socket.on("room:history", onHistory);
    socket.on("message:new", onNewMessage);
    socket.on("room:deleted", onRoomDeleted);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("rooms:list", onRooms);
      socket.off("room:history", onHistory);
      socket.off("message:new", onNewMessage);
      socket.off("room:deleted", onRoomDeleted);
      socket.disconnect();
    };
  }, [username]);

  if (!username) return <Login onLogin={handleLogin} />;

  const currentRoom = rooms.find((r) => r.id === currentRoomId);

  return (
    <div className="flex h-full">
      <RoomList
        rooms={rooms}
        currentRoomId={currentRoomId}
        username={username}
        connected={connected}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={handleLogout}
      />
      <Chat
        roomName={currentRoom?.name}
        messages={messages}
        username={username}
        onMenu={() => setMenuOpen(true)}
      />
    </div>
  );
}

export default App;
