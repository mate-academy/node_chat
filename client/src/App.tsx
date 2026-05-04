import { useEffect, useState } from "react";
import "./App.css";
import { chatApi } from "./api/chatApi";
import { io } from "socket.io-client";
import type { Message, Room } from "./types/chat";

const socket = io("http://localhost:3000", {
  autoConnect: false,
});

function App() {
  const [usernameInput, setUsernameInput] = useState("");
  const [savedUsername, setSavedUsername] = useState(() => {
    return localStorage.getItem("username") || "";
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [renameRoomName, setRenameRoomName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("message:new", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message:new");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!currentRoom) {
      return;
    }

    socket.emit("room:join", currentRoom.id);
  }, [currentRoom]);

  const loadMessages = async (roomId: string) => {
    try {
      const data = await chatApi.getRoomMessages(roomId);
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadRooms = async () => {
    try {
      const data = await chatApi.getRooms();
      setRooms(data);
      setCurrentRoom(data[0] || null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadRooms();
    })();
  }, []);

  useEffect(() => {
    if (!currentRoom) {
      return;
    }

    (async () => {
      await loadMessages(currentRoom.id);
    })();
  }, [currentRoom]);

  const messageHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!savedUsername.trim()) {
      alert("Please set a username before sending messages.");
      return;
    }
    if (!currentRoom) {
      alert("Please select a room before sending messages.");
      return;
    }
    const normalizedMessage = newMessage.trim();

    if (!normalizedMessage) {
      return;
    }

    try {
      await chatApi.sendMessage(
        normalizedMessage,
        savedUsername,
        currentRoom.id,
      );

      setNewMessage("");
    } catch {
      alert("Failed to send message. Please try again.");
    }
  };

  const usernameHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = usernameInput.trim();

    if (normalizedUsername) {
      setSavedUsername(normalizedUsername);
      localStorage.setItem("username", normalizedUsername);
      console.log("Username set to:", normalizedUsername);
    }
    setUsernameInput("");
  };

  const createRoomHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedRoomName = newRoomName.trim();

    if (!normalizedRoomName) {
      return;
    }

    try {
      const createdRoom = await chatApi.createRoom(normalizedRoomName);

      setRooms((prevRooms) => [...prevRooms, createdRoom]);
      setCurrentRoom(createdRoom);
      setNewRoomName("");
    } catch {
      alert("Failed to create room. Please try again.");
    }
  };

  const renameRoomHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentRoom) {
      alert("Please select a room first.");
      return;
    }

    const normalizedRoomName = renameRoomName.trim();

    if (!normalizedRoomName) {
      return;
    }

    try {
      const updatedRoom = await chatApi.renameRoom(
        currentRoom.id,
        normalizedRoomName,
      );

      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === updatedRoom.id ? updatedRoom : room,
        ),
      );

      setCurrentRoom(updatedRoom);
      setRenameRoomName("");
    } catch {
      alert("Failed to rename room. Please try again.");
    }
  };

  const deleteRoomHandler = async () => {
    if (!currentRoom) {
      alert("Please select a room first.");
      return;
    }

    const roomIdToDelete = currentRoom.id;

    try {
      await chatApi.deleteRoom(roomIdToDelete);

      const updatedRooms = rooms.filter((room) => room.id !== roomIdToDelete);

      setRooms(updatedRooms);
      setCurrentRoom(updatedRooms[0] || null);
    } catch {
      alert("Failed to delete room. Please try again.");
    }
  };

  return (
    <div>
      <h1>Chat App</h1>

      <section>
        <h2>Username: {savedUsername ? savedUsername : "-"}</h2>
        <form onSubmit={usernameHandler}>
          <input
            type="text"
            placeholder="Enter your username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />
          <button type="submit">Save</button>
        </form>
      </section>

      <section>
        <h2>Rooms</h2>
        <form onSubmit={createRoomHandler}>
          <input
            type="text"
            placeholder="New room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <button type="submit">Create room</button>
        </form>
        <form onSubmit={renameRoomHandler}>
          <input
            type="text"
            placeholder="Rename current room"
            value={renameRoomName}
            onChange={(e) => setRenameRoomName(e.target.value)}
          />
          <button type="submit" disabled={!currentRoom}>
            Rename current room
          </button>
        </form>
        <button
          type="button"
          onClick={deleteRoomHandler}
          disabled={!currentRoom}
        >
          Delete current room
        </button>
        <div>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setCurrentRoom(room)}
              style={{
                color: currentRoom?.id === room.id ? "purple" : "",
              }}
            >
              {room.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Messages ({messages.length})</h2>
        <div>
          {messages.map((msg) => {
            const isMyMessage = msg.author === savedUsername;
            return (
              <div key={msg.id} style={{ color: isMyMessage ? "green" : "" }}>
                <strong>{msg.author}</strong>: {msg.text}{" "}
                <em>({new Date(msg.timestamp).toLocaleTimeString()})</em>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2>Send message</h2>
        <form onSubmit={messageHandler}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </section>
    </div>
  );
}

export default App;
