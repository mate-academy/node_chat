// #region imports
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { MessageForm } from "./components/MessageForm.jsx";
import { MessageList } from "./components/MessageList.jsx";
import { UsernameForm } from "./components/UsernameForm.jsx";
import { RoomList } from "./components/RoomList.jsx";
import { RoomForm } from "./components/RoomForm.jsx";
import { roomService } from "./services/roomService.js";
import { WS_URL } from "./http/config.js";
// #endregion

export function App() {
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const activeRoomRef = useRef(null);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (activeRoomRef.current?.id === message.roomId) {
        setMessages((prev) => [message, ...prev]);
      }
    });

    socket.addEventListener("error", () => {
      console.error("WebSocket error");
    });

    socket.addEventListener("close", () => {
      console.warn("WebSocket closed");
    });

    return () => socket.close();
  }, []);

  const loadRooms = () => roomService.getAll().then(setRooms);

  useEffect(() => {
    if (username) loadRooms();
  }, [username]);

  useEffect(() => {
    if (activeRoom) {
      roomService.getMessages(activeRoom.id).then(setMessages);
    }
  }, [activeRoom]);

  if (!username) {
    return (
      <section className="section content">
        <h1 className="title">Chat application</h1>
        <UsernameForm onSave={setUsername} />
      </section>
    );
  }

  if (!activeRoom) {
    return (
      <section className="section content">
        <h1 className="title">Chat application</h1>
        <RoomForm onCreated={loadRooms} />
        <RoomList rooms={rooms} onJoin={setActiveRoom} onUpdate={loadRooms} />
      </section>
    );
  }

  return (
    <section className="section content">
      <h1 className="title">{activeRoom.name}</h1>
      <button className="button" onClick={() => setActiveRoom(null)}>← Back to rooms</button>
      <MessageForm roomId={activeRoom.id} />
      <MessageList messages={messages} />
    </section>
  );
}
