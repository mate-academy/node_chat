import { useState } from 'react';
import './CreateChatModal.scss';

function CreateChatModal({ onClose, onChatCreated, currentUser }) {
  const [chatName, setChatName] = useState('');
  const [userNumber, setUserNumber] = useState('');

  const handleCreate = async () => {
    if (!chatName.trim()) {
      // eslint-disable-next-line no-alert
      alert('Chat name cannot be empty');

      return;
    }

    try {
      const chatData = { name: chatName, creatorId: currentUser.id };

      if (userNumber.trim() !== '') {
        chatData.number = userNumber;
      }

      const response = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || 'Failed to create chat');
      }

      const newChat = await response.json();

      onChatCreated(newChat);
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="button"
      tabIndex="0"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClose();
      }}
    >
      <div
        className="modal-content"
        role="button"
        tabIndex="-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.stopPropagation();
        }}
      >
        <div className="modal-header">
          <h2>New Chat</h2>
          <button type="button" className="close-btn" onClick={onClose}>
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
          <button type="button" className="create-btn" onClick={handleCreate}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateChatModal;
