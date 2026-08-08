// #region imports
import { useEffect, useState } from "react";
import "./App.css";
import { MessageForm } from "./MessageForm.jsx";
import { MessageList } from "./MessageList.jsx";
import { UsernameForm } from "./UsernameForm.jsx";
import { RoomsForm } from "./RoomsForm.jsx";
import { RoomsList } from "./RoomsList.jsx";
// #endregion

const DataLoader = ({ onData, username, onLogout, currentRoomId }) => {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3005");

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      if (message.roomId === currentRoomId) {
        onData(message);
      }
    });

    return () => {
      socket.close();
    };
  }, [currentRoomId]);

  return (
    <div>
      <h1 className="title">Chat application</h1>

      {username ? (
        <div className="column is-8 is-fl">
          <h4>Active user: {username}</h4>{" "}
          <button className="button is-rounded" onClick={onLogout}>
            logout{" "}
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export function App() {
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState(() =>
    localStorage.getItem("chat_username" || ""),
  );

  useEffect(() => {
    fetch("http://localhost:3005/rooms")
      .then((response) => response.json())
      .then(setRooms);
  }, []);

  function userLogout() {
    localStorage.removeItem("chat_username");
    setUsername("");
  }

  function saveData(message) {
    if (message.roomId !== currentRoomId) {
      return;
    }

    setMessages((messages) => [message, ...messages]);
  }

  useEffect(() => {
    if (!currentRoomId) {
      return;
    }

    fetch(`http://localhost:3005/rooms/${currentRoomId}/messages`)
      .then((response) => response.json())
      .then(setMessages);
  }, [currentRoomId]);

  return (
    <section className="section content">
      <DataLoader
        onData={saveData}
        username={username}
        onLogout={userLogout}
        currentRoomId={currentRoomId}
      />
      {username ? (
        <>
          <RoomsForm
            onRoomId={setCurrentRoomId}
            onRoomCreated={(room) => setRooms((rooms) => [...rooms, room])}
          />
          <RoomsList rooms={rooms} onRoomId={setCurrentRoomId} onRoomUpdate={setRooms} />
          {currentRoomId && (
            <>
              <MessageForm currentRoomId={currentRoomId} />
              <MessageList messages={messages} />
            </>
          )}
        </>
      ) : (
        <UsernameForm onUsername={setUsername} />
      )}
    </section>
  );
}
