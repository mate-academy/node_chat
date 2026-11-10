import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { Message } from "../types/Message";
import { socket } from "../soket";
import type { Chat } from "../types/Chat";

export const ChatPage: React.FC = () => {
  const { chatId } = useParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chat, setChat] = useState<Chat>();
  const navigate = useNavigate();

  const user = localStorage.getItem("user");

  useEffect(() => {
    if (!chatId || !user) return;

    async function loadChat() {
      try {
        const response = await axios.get<Chat>(
          `http://localhost:3005/chats/${chatId}`,
        );

        const currentChat = response.data;

        setChat(currentChat);

        if (!currentChat.users.includes(user || "")) {
          return;
        }

        const messagesResponse = await axios.get<Message[]>(
          `http://localhost:3005/messages/${chatId}`,
        );

        setMessages(messagesResponse.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          navigate("/");
          return;
        }
        console.error(error);
      }
    }

    loadChat();
  }, [chatId, user, navigate]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const message: Message = JSON.parse(event.data);

      if (message.chatId !== chatId) return;

      setMessages((prev) => [...prev, message]);
    }

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [chatId]);

  async function sendMessage() {
    if (!newMessage.trim() || !chatId || !user) return;

    try {
      await axios.post(`http://localhost:3005/messages/${chatId}`, {
        text: newMessage,
        author: user,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  return (
    <div
      style={{
        maxWidth: "700px",
        height: "80vh",
        margin: "30px auto",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 20px",
          backgroundColor: "#2563eb",
          color: "#fff",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "20px" }}>{chat?.name || "Chat"}</h2>
        <span style={{ fontSize: "12px", opacity: 0.8 }}>
          Online conversation
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.map((message) => {
          const isOwnMessage = message.author === user;

          return (
            <div
              key={message.id}
              style={{
                alignSelf: isOwnMessage ? "flex-end" : "flex-start",
                padding: "10px 14px",
                backgroundColor: isOwnMessage ? "#2563eb" : "#fff",
                color: isOwnMessage ? "#fff" : "#1e293b",
                borderRadius: "4px",
                border: isOwnMessage ? "none" : "1px solid #e2e8f0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                overflowWrap: "anywhere",
              }}
            >
              <strong style={{ fontSize: "12px" }}>{message.author}</strong>

              <p style={{ margin: "5px 0 0", fontSize: "14px" }}>
                {message.text}
              </p>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "11px",
                  opacity: 0.7,
                  textAlign: "right",
                }}
              >
                {new Date(message.time).toLocaleTimeString("uk-UA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "15px",
          backgroundColor: "#fff",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Write a message..."
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
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          style={{
            padding: "0 20px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            opacity: newMessage.trim() ? 1 : 0.5,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};
