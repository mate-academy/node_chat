import { useCallback, useEffect, useState } from 'react';
import './ChatInfoModal.scss';

function ChatInfoModal({
  onClose,
  chat,
  onChatDeleted,
  onChatUpdated,
  currentUserId,
}) {
  const [members, setMembers] = useState([]);
  const [newName, setNewName] = useState(chat.name || '');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditChatName, setIsEditChatName] = useState(false);
  const [prevvChatId, setPrevvChatId] = useState(chat.id);

  useEffect(() => {
    if (chat.id !== prevvChatId) {
      setPrevvChatId(chat.id);
      setNewName(chat.name || '');
    }
  }, [chat.id, chat.name, prevvChatId, setNewName]);

  const fetchMembers = useCallback(async () => {
    if (!chat.id) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/chats/${chat.id}/members`,
      );
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chat.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const [prevChatId, setPrevChatId] = useState(chat.id);
  if (chat.id !== prevChatId) {
    setPrevChatId(chat.id);
    setNewName(chat.name || '');
  }
  const handleUpdateName = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/chats/${chat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) onChatUpdated(chat.id, newName);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleDeleteChat = async () => {
    if (window.confirm('Delete this chat for everyone?')) {
      const res = await fetch(`http://localhost:5000/api/chats/${chat.id}`, {
        method: 'DELETE',
      });
      if (res.ok) onChatDeleted(chat.id);
    }
  };

  const addMember = async () => {
    if (!newMemberPhone.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/chats/${chat.id}/members`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: newMemberPhone }),
        },
      );

      if (res.ok) {
        setNewMemberPhone('');
        fetchMembers();
      }
    } catch (err) {
      console.error('Add member error:', err);
    }
  };

  const removeMember = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/chats/${chat.id}/members/${userId}`,
        {
          method: 'DELETE',
        },
      );

      if (res.ok) {
        await fetchMembers();
      }
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div
        className="chat-modal-content"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="modal-header">
          <h2>Chat info</h2>
          <button className="button-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="items-block">
          <div className="section-name">
            <div
              className="item chat-name"
              onClick={() => {
                setIsEditChatName(true);
              }}
            >
              Chat name: {!isEditChatName && (chat.name || chat.recipient_name)}
            </div>
            {isEditChatName && (
              <div className="input-block">
                {' '}
                <input
                  className="item-input"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Chat Name"
                />
                <button
                  className="input-button"
                  onClick={() => {
                    handleUpdateName();
                    setIsEditChatName(false);
                  }}
                >
                  Save Name
                </button>
              </div>
            )}
          </div>

          <div className="section-members">
            <div className="item">Chat members ({members.length}):</div>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              members.map((m) => (
                <div key={m.id} className="member-item">
                  <div className="item">
                    {m.name} ({m.phone})
                  </div>
                  {String(m.id) !== String(currentUserId) && (
                    <button
                      className="button-close"
                      onClick={() => removeMember(m.id)}
                    >
                      &times;
                    </button>
                  )}
                  {String(m.id) == String(currentUserId) && <div>- you</div>}
                </div>
              ))
            )}
            <div className="addMember-block">
              <input
                className="item-input"
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
                placeholder="Enter phone"
              />
              <button className="input-button" onClick={addMember}>
                Add Member
              </button>
            </div>
          </div>

          <button className="delete-btn" onClick={handleDeleteChat}>
            Delete Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInfoModal;
