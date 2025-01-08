import React, { useState, useEffect } from 'react';
import { createNewChatService } from '../services/createNewChatService.js';
import * as Types from '../types/types';
// import '../style/CreateNewChatModal.scss';

interface CreateNewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chat: Types.Chat) => void;
}

const CreateNewChatModal: React.FC<CreateNewChatModalProps> = ({
  isOpen,
  onClose,
  onChatCreated,
}) => {
  const [chatName, setChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [availableUsers, setAvailableUsers] = useState<
    Types.NormalizedUserList[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      createNewChatService
        .getAllUsers()
        .then((data) => {
          console.log('Fetched users:', data);
          setAvailableUsers(data);
          console.log('Available users state:', availableUsers);
        })
        .catch((error) => console.error('Error fetching users:', error));
    }
  }, [isOpen]);

  console.log('Available users state:', availableUsers);

  const handleCreateChat = async () => {
    if (!chatName.trim() || selectedUsers.length === 0) {
      alert('Введіть назву чату та оберіть хоча б одного учасника');
      return;
    }

    try {
      const newChat = await createNewChatService.createOne(
        chatName.trim(),
        selectedUsers,
      );
      onChatCreated(newChat);
      onClose();
    } catch (error) {
      console.error('Помилка при створенні чату:', error);
      alert('Не вдалося створити чат');
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <div className={`modal ${isOpen ? 'is-active' : ''}`}>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Create new chat</p>
          <button
            className="delete"
            aria-label="close"
            onClick={onClose}
          ></button>
        </header>
        <section className="modal-card-body">
          <div className="field">
            <label className="label">Chat name</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="Введіть назву чату"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Choose participants</label>
            <div className="control is-flex is-flex-wrap-wrap">
              {availableUsers.length > 0 ? (
                availableUsers.map(({ id, name }) => (
                  <div
                    key={id}
                    className={`tag is-clickable ${
                      selectedUsers.includes(id) ? 'is-primary' : 'is-light'
                    }`}
                    onClick={() => toggleUserSelection(id)}
                  >
                    {name}
                  </div>
                ))
              ) : (
                <p className="has-text-grey">...</p>
              )}
            </div>
          </div>
        </section>
        <footer className="modal-card-foot">
          <button className="button is-success" onClick={handleCreateChat}>
            Create
          </button>
          <button className="button" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CreateNewChatModal;
