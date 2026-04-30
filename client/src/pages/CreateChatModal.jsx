import { useState } from "react";
import "./CreateChatModal.scss";
function CreateChatModal({ onClose, onChatCreated, currentUser }) {
  const [chatName, setChatName] = useState("");
  const [userNumber, setUserNumber] = useState("");

  const handleCreate = async () => {
    try {
      const chatData = { name: chatName, creatorId: currentUser.id };

      if (userNumber.trim() !== "") {
        chatData.number = userNumber;
      }

      const response = await fetch("http://localhost:5000/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatData),
      });

      const newChat = await response.json();
      onChatCreated(newChat);
      onClose();
    } catch (err) {
      console.error("Error creating chat:", err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Chat</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <input
            type="text"
            placeholder="Enter chat name..."
            className="modal-input"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter phone number user..."
            className="modal-input"
            value={userNumber}
            onChange={(e) => setUserNumber(e.target.value)}
          />
          <button className="create-btn" onClick={handleCreate}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateChatModal;
