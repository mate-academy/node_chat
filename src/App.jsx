/* eslint-disable */
import { useEffect, useState } from "react";
import { MessagesList } from "./components/MessagesList.jsx";

const socket = new WebSocket("ws://localhost:3232");

export const App = () => {
  const [name, setName] = useState(localStorage.getItem("Name") || "");
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "rooms") {
        setRooms(data.list);
      }

      if (data.type === "history") {
        setMessages(data.messages);
      }

      if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      }
    };
  }, []);

  function saveName() {
    if (!name.trim()) return;
    localStorage.setItem("Name", name);
  }

  function joinRoom(r) {
    setRoom(r);
    setMessages([]);

    socket.send(
      JSON.stringify({
        type: "join_room",
        name: r,
      }),
    );
  }

  function createRoom() {
    if (!room.trim()) return;

    socket.send(
      JSON.stringify({
        type: "create_room",
        name: room,
      }),
    );
  }

  function deleteRoom() {
    socket.send(
      JSON.stringify({
        type: "delete_room",
        name: room,
      }),
    );

    setRoom("");
    setMessages([]);
  }

  function sendMessage() {
    if (!message.trim()) return;

    socket.send(
      JSON.stringify({
        type: "message",
        author: name,
        text: message,
      }),
    );

    setMessage("");
  }

  return (
    <div>
      {!name && (
        <div>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={saveName}>Save</button>
        </div>
      )}

      {name && (
        <div>
          <h3>Rooms</h3>
          {rooms.map((r) => (
            <button key={r} onClick={() => joinRoom(r)}>
              {r}
            </button>
          ))}

          <input
            placeholder="Room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={createRoom}>Create</button>
          <button onClick={deleteRoom}>Delete</button>
        </div>
      )}

      {room && (
        <div>
          <input
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>

          <MessagesList list={messages} />
        </div>
      )}
    </div>
  );
};
