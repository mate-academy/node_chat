import { useState } from 'react';
import { useWebSocket } from '../../context/hooks';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearCurrentRoom } from '../../store/slices/currentRoomSlice';
import { clearMessages } from '../../store/slices/messagesSlice';
import { MessageForm } from './MessageForm';
import { MessageList } from './MessageList';

export const RoomChat = () => {
  const socket = useWebSocket();
  const dispatch = useAppDispatch();

  const room = useAppSelector(
    (state) => state.currentRoom.currentRoom,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editedRoomName, setEditedRoomName] = useState(room?.name || '');

  const username = socket?.user.name;

  function handleEditRoomName() {
    if (!room) return;

    setEditedRoomName(room.name);
    setIsEditing(true);
  }

  function handleSaveRoomName() {
    if (!socket || !room) return;

    const newName = editedRoomName.trim();

    if (!newName) return;

    if (newName === room.name) {
      setIsEditing(false);
      return;
    }

    socket.send(
      JSON.stringify({
        type: 'RENAME_ROOM',
        roomId: room.id,
        name: newName,
      }),
    );

    setIsEditing(false);
  }

  function handleDeleteRoom() {
    if (!socket || !room) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${room.name}"?`,
    );

    if (!confirmed) return;

    socket.send(
      JSON.stringify({
        type: 'DELETE_ROOM',
        roomId: room.id,
      }),
    );
  }

  function handleLeaveRoom() {
    if (!socket || !room) return;

    socket.send(
      JSON.stringify({
        type: 'LEAVE_ROOM',
      }),
    );

    // eslint-disable-next-line react-hooks/immutability
    socket.user.roomId = null;

    dispatch(clearCurrentRoom());
    dispatch(clearMessages());
  }

  function handleSendMessage(text: string) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: 'SEND_MESSAGE',
        text,
      }),
    );
  }

  if (!room || !username) {
    return null;
  }

  const isOwner = room.owner.name === username;

  return (
    <>
      <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
        {isEditing ? (
          <input
            className="input"
            type="text"
            value={editedRoomName}
            onChange={(event) => setEditedRoomName(event.target.value)}
            autoFocus
          />
        ) : (
          <h2 className="title is-5 mb-0">
            {room.name}
          </h2>
        )}

        <div className="is-flex is-align-items-center">
          {isOwner && (
            <>
              <button
                className="button is-warning mr-2"
                onClick={
                  isEditing
                    ? handleSaveRoomName
                    : handleEditRoomName
                }
              >
                <span className="icon">
                  <i className={isEditing ? 'fas fa-save' : 'fas fa-edit'} />
                </span>
                <span>{isEditing ? 'Save' : 'Rename'}</span>
              </button>

              <button
                className="button is-danger mr-2"
                disabled={isEditing}
                onClick={handleDeleteRoom}
              >
                <span className="icon">
                  <i className="fas fa-trash" />
                </span>
                <span>Delete</span>
              </button>
            </>
          )}

          <button
            className="button is-light leave-button"
            onClick={handleLeaveRoom}
            disabled={isEditing}
          >
            <span className="icon">
              <i className="fas fa-sign-out-alt" />
            </span>
            <span>Leave</span>
          </button>
        </div>
      </div>

      <MessageList />

      <div className="mt-5">
        <MessageForm onSend={handleSendMessage} />
      </div>
    </>
  );
};
