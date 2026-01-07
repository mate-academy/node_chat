import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { MessageForm } from "./components/MessageForm.jsx";
import { MessageList } from "./components/MessageList.jsx";

export const API = "http://localhost:3005";

export function App() {
  // #region hooks
  const [userName, setUserName] = useState(
    localStorage.getItem("authorName") || ""
  );
  const [localName, setLocalName] = useState(
    localStorage.getItem("authorName") || ""
  );
  const [roomName, setRoomName] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  // #endregion

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${API}/rooms`);
        setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    if (!currentRoomId) {
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API}/rooms/${currentRoomId}/messages`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [currentRoomId]);

  useEffect(() => {
    if (!currentRoomId) return;

    const eventSource = new EventSource(
      `${API}/events?roomId=${currentRoomId}`
    );

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.type === "new-message") {
        setMessages((prev) => [...prev, parsed.payload]);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [currentRoomId]);

  // #region functions
  const saveAuthor = () => {
    if (!localName) {
      return;
    }

    localStorage.setItem("authorName", localName);
    setUserName(localName);
  };

  const joinOrCreateRoom = async () => {
    if (!roomName) {
      return;
    }

    const existingRoom = rooms.find((r) => r.name === roomName);

    if (existingRoom) {
      setCurrentRoomId(existingRoom.id);
      setRoomName("");
      return;
    }

    try {
      const res = await axios.post(`${API}/rooms`, { name: roomName });
      setCurrentRoomId(res.data.id);
      setRooms((prev) => [...prev, res.data]);
      setRoomName("");
    } catch (err) {
      console.error("Failed to create room:", err);
      alert("Failed to create room");
    }
  };
  // #endregion

  return (
    <section className="section content">
      {!userName && (
        <section className="section__user">
          <input
            className="input"
            placeholder="Enter your name"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
          />
          <button className="button" onClick={saveAuthor}>
            {" "}
            Save{" "}
          </button>
        </section>
      )}

      {userName && !currentRoomId && (
        <section className="section__room">
          <input
            className="input"
            placeholder="Enter room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button className="button" onClick={joinOrCreateRoom}>
            Join / Create Room
          </button>
        </section>
      )}

      {rooms.length > 0 && (
        <section className="section__rooms">
          <p>Rooms:</p>
          <ul>
            {rooms.map((r) => (
              <li
                key={r.id}
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <span
                  style={{ cursor: "pointer", color: "blue" }}
                  onClick={() => setCurrentRoomId(r.id)}
                >
                  {r.name}
                </span>
                <button
                  onClick={async () => {
                    const newName = prompt("Enter new room name", r.name);
                    if (!newName.trim()) return;
                    try {
                      const res = await axios.patch(`${API}/rooms/${r.id}`, {
                        name: newName,
                      });
                      setRooms((prev) =>
                        prev.map((room) => (room.id === r.id ? res.data : room))
                      );
                    } catch (err) {
                      console.error("Failed to rename room:", err);
                    }
                  }}
                >
                  Rename
                </button>
                <button
                  onClick={async () => {
                    // eslint-disable-next-line no-restricted-globals
                    if (!confirm("Delete this room?")) return;
                    try {
                      await axios.delete(`${API}/rooms/${r.id}`);
                      setRooms((prev) =>
                        prev.filter((room) => room.id !== r.id)
                      );
                      if (currentRoomId === r.id) setCurrentRoomId("");
                    } catch (err) {
                      console.error("Failed to delete room:", err);
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {userName && currentRoomId && (
        <>
          <h1 className="title">
            Chat: {rooms.find((r) => r.id === currentRoomId)?.name || "Unknown"}
          </h1>
          <MessageForm authorName={userName} roomId={currentRoomId} />
          <MessageList messages={messages} />
        </>
      )}
    </section>
  );
}
