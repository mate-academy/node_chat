import { Link, useNavigate, useParams } from "react-router";
import { useSocket } from "../../hooks/use-socket.hook";
import { useEffect, useState, type FormEvent } from "react";

type Message = {
  author: string;
  message: string;
  timestamp: string;
};

export const CurrentRoom = () => {
  const socketRef = useSocket();
  const { chatId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("join-room", chatId);

    socket.on("room-history", (data) => {
      setMessages(data);
    });

    socket.on("join-error", () => {
      navigate("/");
    });

    socket.on("room-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("room-renamed", (data) => {
      navigate(`/chats/${data.newRoom}`);
    });

    socket.on("room-deleted", () => {
      navigate("/");
    });

    return () => {
      socket.emit("leave-room", chatId);
      socket.off("room-history");
      socket.off("join-error");
      socket.off("room-renamed");
      socket.off("room-deleted");
    };
  }, [socketRef]);

  const handleSendMessage = (event: FormEvent) => {
    event.preventDefault();
    const socket = socketRef.current;
    if (socket && message.trim() !== "") {
      socket.emit("room-message", {
        roomId: chatId,
        message,
        timestamp: new Date().toISOString(),
      });
      setMessages((prev) => [
        ...prev,
        {
          author: localStorage.getItem("username") || "guest",
          message,
          timestamp: new Date().toISOString(),
        },
      ]);
      setMessage("");
    }
  };

  const handleRenameRoom = (event: FormEvent) => {
    event.preventDefault();
    const socket = socketRef.current;
    if (socket && newRoomName.trim() !== "") {
      socket.emit("rename-room", chatId, newRoomName);
    }
    setNewRoomName("");
  };

  const handleDeleteRoom = (event: FormEvent) => {
    event.preventDefault();
    const socket = socketRef.current;
    if (socket) {
      socket.emit("delete-room", chatId);
    }
  };

  return (
    <div>
      <Link to="/">Back</Link>
      <h2>Room {chatId}</h2>
      <form onSubmit={handleRenameRoom}>
        <input
          type="text"
          placeholder="New room name"
          value={newRoomName}
          onChange={(event) => setNewRoomName(event.target.value)}
        />
        <button type="submit">Rename room</button>
      </form>
      <button onClick={handleDeleteRoom}>Delete room</button>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      <div>
        <h3>Messages</h3>
        {messages.map((message) => (
          <div key={message.timestamp + message.author}>
            <p>{message.message}</p>
            <p>{message.author}</p>
            <p>{message.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
