import React, { useState, useEffect } from 'react';
import { createNewChatService } from '../services/createNewChatService.js';
import * as Types from '../types/types';
import { roomService } from '../services/chatServise.js';

interface CreateNewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chat: Types.Chat) => void;
  onChatUpdated: (chat: Types.Chat) => void;
  editingChat: Types.Chat | null;
  usersOfChat: number[];
  setEditingChat: React.Dispatch<React.SetStateAction<Types.Chat | null>>
}

const CreateNewChatModal: React.FC<CreateNewChatModalProps> = ({
  isOpen,
  onClose,
  onChatCreated,
  onChatUpdated,
  editingChat,
  usersOfChat,
  setEditingChat,
}) => {
  const [chatName, setChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [availableUsers, setAvailableUsers] = useState<
    Types.NormalizedUserList[]
  >([]);

  useEffect(() => {
    if (isOpen && editingChat) {
      setChatName(editingChat.name || '');
      setSelectedUsers(usersOfChat || []);
      createNewChatService
        .getAllUsers()
        .then((data) => {
          setAvailableUsers(data);
        })
        .catch((error) => console.error('Error fetching users:', error));
      roomService.getUsersOfChat(editingChat.id).then((data) => setSelectedUsers(data)).catch((error) => console.error('Error fetching users:', error))
    } else {
      if (isOpen) {
        createNewChatService
        .getAllUsers()
        .then((data) => {
          setAvailableUsers(data);
        })
        .catch((error) => console.error('Error fetching users:', error));
      }
    }
  }, [isOpen, editingChat]);

  const resetState = () => {
    setChatName('');
    setSelectedUsers([]);
    setEditingChat(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

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
      handleClose();
    } catch (error) {
      console.error('Помилка при створенні чату:', error);
      alert('Не вдалося створити чат');
    }
  };

  const handleSaveChanges = async () => {
    if (chatName.trim() && editingChat && selectedUsers.length > 0) {
      try {
        const updatedChatName = await roomService.renameChat(
          chatName,
          editingChat?.id,
        );
        const updatedChatUsers = await roomService.addUsers(
          editingChat?.id,
          selectedUsers,
        );
        onChatUpdated(updatedChatName);
        onChatUpdated(updatedChatUsers);
        handleClose();
      } catch (error) {
        console.error('Error renaming chat:', error);
      }
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
      <div className="modal-background" onClick={handleClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">
            {editingChat ? 'Edit Chat' : 'Create New Chat'}
          </p>
          <button
            className="delete"
            aria-label="close"
            onClick={handleClose}
          ></button>
        </header>
        <section className="modal-card-body">
          {editingChat ? (
            <div>
              <div className="field">
                <label className="label">Chat Name</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Choose Users</label>
                <div className="control is-flex is-flex-wrap-wrap">
                  {availableUsers.map(({ id, name }) => (
                    <div
                      key={id}
                      className={`tag is-clickable ${selectedUsers.includes(id) ? 'is-primary' : 'is-light'}`}
                      onClick={() =>
                        setSelectedUsers((prev) =>
                          prev.includes(id)
                            ? prev.filter((i) => i !== id)
                            : [...prev, id],
                        )
                      }
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="field">
                <label className="label">Chat name</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
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
            </div>
          )}
        </section>
        <footer className="modal-card-foot">
          <button
            className="button is-success"
            onClick={editingChat ? handleSaveChanges : handleCreateChat}
          >
            {editingChat ? 'Save changes' : 'Create'}
          </button>
          <button className="button" onClick={handleClose}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CreateNewChatModal;
