/* eslint-disable */
import { useEffect, useState } from "react";
import { MessagesList } from "./components/MessagesList.jsx";

const socket = new WebSocket("ws://localhost:3232");

export const App = () => {
  const [name, setName] = useState(localStorage.getItem("Name") || "");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("");

  useEffect(() => {
    socket.onopen = () => {
      console.log("Connected to server");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      }

      if (data.type === "history") {
        setMessages(data.messages);
      }
    };
  }, []);

  function saveName() {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    localStorage.setItem("Name", name);
  }

  function joinRoom() {
    if (!room.trim()) return;

    socket.send(
      JSON.stringify({
        type: "join_room",
        name: room,
      }),
    );

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
          <button onClick={saveName}>Save name</button>
        </div>
      )}

      {name && !room && (
        <div>
          <input
            placeholder="Room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join room</button>
        </div>
      )}

      {name && room && (
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
