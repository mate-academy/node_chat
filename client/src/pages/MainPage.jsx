import { useEffect, useState, useRef } from "react";
import "../App.scss";
import CreateChatModal from "./CreateChatModal";
import { io } from "socket.io-client";
import LogoutIcon from "@mui/icons-material/Logout";
import UserInfoModal from "./UserInfoModal";
import ChatInfoModal from "./ChatInfoModal";
import userPhoto from '../img/user-photo.jpg';

const socket = io("http://localhost:5000");

function MainPage({ currentUser, onLogout }) {
  const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState(false);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
  const [isChatInfoModalOpen, setIsChatInfoModalOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const messagesEndRef = useRef(null);

  const MY_ID = currentUser?.id;

  useEffect(() => {
    socket.on("update_chat_list", (data) => {
      setChats((prevChats) => {
        const isExist = prevChats.some((chat) => chat.id === data.chat_id);

        if (!isExist) {
          return prevChats;
        }

        const updated = prevChats.map((chat) =>
          chat.id === data.chat_id
            ? {
                ...chat,
                last_message: data.content,
                last_message_time: data.created_at,
                unread_count:
                  chat.id !== selectedChat?.id
                    ? Number(chat.unread_count || 0) + 1
                    : 0,
              }
            : chat
        );

        return [...updated].sort(
          (a, b) =>
            new Date(b.last_message_time || b.created_at) -
            new Date(a.last_message_time || a.created_at)
        );
      });
    });

    if (selectedChat) {
      socket.emit("join_chat", selectedChat.id);
      socket.on("receive_message", (newMessage) => {
        if (newMessage.chat_id === selectedChat.id) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      });
    }

    return () => {
      socket.off("receive_message");
      socket.off("update_chat_list");
    };
  }, [selectedChat, MY_ID]);

  useEffect(() => {
    if (MY_ID) {
      fetch(`http://localhost:5000/api/chats/${MY_ID}`)
        .then((res) => res.json())
        .then((data) => {
          setChats(data);
        })
        .catch((err) => console.log("Error loading chats:", err));
    }
  }, [MY_ID]);

  useEffect(() => {
    if (MY_ID) {
      fetch(`http://localhost:5000/api/users/${MY_ID}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
        })
        .catch((err) => console.log("Error loading user data:", err));
    }
  }, [MY_ID]);

  const handleChatCreated = (newChat) => {
    setChats((prevChats) => [newChat, ...prevChats]);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    try {
      const response = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: selectedChat.id,
          sender_id: MY_ID,
          content: messageText,
        }),
      });

      if (response.ok) {
        setMessageText("");
      }
    } catch (err) {
      console.error("Error sending:", err);
    }
  };
  const handleChatClick = async (chat) => {
    setSelectedChat(chat);

    try {
      await fetch(`http://localhost:5000/api/messages/read/${chat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: MY_ID }),
      });

      setChats((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, unread_count: 0 } : c))
      );

      const response = await fetch(
        `http://localhost:5000/api/messages/${chat.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error handling chat click:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChatDeleted = (chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setSelectedChat(null);
    setIsChatInfoModalOpen(false);
  };

  const handleChatUpdated = (chatId, newName) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, name: newName } : c))
    );
    setSelectedChat((prev) => ({ ...prev, name: newName }));
  };

  return (
    <div className="main-layout">
      {isCreateChatModalOpen && (
        <CreateChatModal
          currentUser={currentUser}
          onClose={() => setIsCreateChatModalOpen(false)}
          onChatCreated={handleChatCreated}
        />
      )}
      {isUserInfoModalOpen && (
        <UserInfoModal
          onClose={() => setIsUserInfoModalOpen(false)}
          user={user}
        />
      )}
      {isChatInfoModalOpen && (
        <ChatInfoModal
          onClose={() => setIsChatInfoModalOpen(false)}
          chat={selectedChat}
          onChatDeleted={handleChatDeleted}
          onChatUpdated={handleChatUpdated}
          currentUserId={MY_ID}
        />
      )}
      <header className="header">
        <div className="title" onClick={() => setSelectedChat(null)}>
          Chats
        </div>
        <div className="header-left-data">
          <div
            className="add-chat"
            onClick={() => setIsCreateChatModalOpen(true)}
          >
            +
          </div>
          <img
            onClick={() => setIsUserInfoModalOpen(true)}
            className="user-photo"
            src={userPhoto}
            alt="user_photo"
          />
          <button className="logout-button" onClick={onLogout}>
            <LogoutIcon />
          </button>
        </div>
      </header>
      <div className="main">
        <div className="chats-block">
          <>
            {chats.map((chat) => (
              <div
                className={`chat-block-info ${
                  selectedChat?.id === chat.id ? "active" : ""
                }`}
                key={chat.id}
                onClick={() => handleChatClick(chat)}
              >
                <div className="chat-block-left-data">
                  <img
                    className="chat-photo"
                    src={userPhoto}
                    alt="chat"
                  />
                  <div className="text-info">
                    <div className="chat-name">
                      {chat.name || chat.recipient_name || "Unnamed Chat"}
                    </div>
                    <div className="chat-message">
                      {chat.last_message || "No messages yet"}
                    </div>
                  </div>
                </div>
                <div className="chat-block-right-data">
                  <div className="message-time">
                    {chat.last_message_time || chat.created_at
                      ? new Date(
                          chat.last_message_time || chat.created_at
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                  {parseInt(chat.unread_count) > 0 && (
                    <div className="message-count">{chat.unread_count} </div>
                  )}
                </div>
              </div>
            ))}
          </>
        </div>
        <div className="open-chat">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <img
                  onClick={() => setIsChatInfoModalOpen(true)}
                  className="chat-photo"
                  src={userPhoto}
                  alt="chat_img"
                />
                <div
                  className="header-chat-name"
                  onClick={() => setIsChatInfoModalOpen(true)}
                >
                  {selectedChat.name || selectedChat.recipient_name || "Chat"}
                </div>
              </div>

              <div className="messages-block">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${
                      msg.sender_id === MY_ID ? "sent" : "received"
                    }`}
                  >
                    {msg.sender_id !== MY_ID && (
                      <div className="user-name">{msg.sender_name}</div>
                    )}
                    <div className="text-info-message">
                      <div className="user-message">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="send-message">
                <input
                  type="text"
                  className="send-message-field"
                  placeholder="Write a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <div className="send-message-button" onClick={sendMessage}>
                  &#10148;
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              Select a chat to start communicating
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainPage;
