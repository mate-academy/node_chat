import axios from "axios";
import { useEffect, useState } from "react";
import { ChatItem } from "../components/ChatItem";
import type { Chat } from "../types/Chat";

export const ChatsPage = () => {
  const [nameNewChat, setNameNewChat] = useState<string>("");
  const [chats, setChats] = useState<Chat[] | null>(null);
  const user = localStorage.getItem("user");

  async function createChat(name: string) {
    const response = await axios.post<Chat>("http://localhost:3005/chats", {
      name,
      author: user,
    });

    const newChat = response.data;

    if (!newChat) {
      return;
    }

    setChats((prev) => [newChat, ...(prev ?? [])]);
  }

  useEffect(() => {
    async function loadChats() {
      const response = await axios.get<Chat[]>("http://localhost:3005/chats");

      setChats(response.data.reverse());
    }

    loadChats();
  }, []);

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
      }}
    >
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>My chats</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <input
          type="text"
          placeholder="Enter chat name..."
          value={nameNewChat}
          onChange={(e) => setNameNewChat(e.target.value)}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
          }}
        />

        <button
          onClick={() => {
            if (!nameNewChat.trim()) return;

            createChat(nameNewChat);
            setNameNewChat("");
          }}
          style={{
            padding: "12px 18px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Create
        </button>
      </div>

      <h3 style={{ fontSize: "16px", color: "#475569", marginBottom: "12px" }}>
        Your conversations
      </h3>

      {chats?.map((chat) => (
        <ChatItem chat={chat} setChats={setChats} key={chat.id} />
      ))}
    </div>
  );
};
