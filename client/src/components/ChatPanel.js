import { useEffect, useRef, useState } from 'react';

export const ChatPanel = ({
  currentRoom,
  canEdit,
  chatLog,
  socket,
  clearSelectedRoom,
}) => {
  const [message, setMessage] = useState('');
  const [renameInput, setRenameInput] = useState('');

  const messageInputRef = useRef(null);
  const scrollAnchorRef = useRef(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const sendChatMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    socket.send(JSON.stringify({
      type: 'send-message',
      payload: { content: trimmed },
    }));

    setMessage('');
    messageInputRef.current?.focus();
  };

  const deleteCurrentRoom = () => {
    socket.send(JSON.stringify({
      type: 'remove-room',
      payload: { name: currentRoom },
    }));

    clearSelectedRoom('');
  };

  const renameCurrentRoom = () => {
    const name = renameInput.trim();
    if (!name || name === currentRoom) return;

    socket.send(JSON.stringify({
      type: 'update-room',
      payload: { oldName: currentRoom, newName: name },
    }));

    clearSelectedRoom(name);
    setRenameInput('');
  };

  return (
    <div className="flex flex-col flex-1">
      <h2 className="text-xl font-bold mb-4">
        Room: <span className="text-indigo-600">{currentRoom}</span>
      </h2>

      {canEdit && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              placeholder="Rename room"
              className="px-2 py-1 border rounded-md w-52"
            />
            <button
              onClick={renameCurrentRoom}
              className="text-sm text-yellow-700 hover:underline"
            >
              Rename
            </button>
          </div>
          <button
            onClick={deleteCurrentRoom}
            className="text-sm text-red-600 hover:underline"
          >
            Delete room
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-gray-50 rounded border p-3 space-y-2">
        {chatLog.map((entry) => (
          <div key={entry.time}>
            <div className="text-xs text-gray-500 mb-1">
              {entry.author} • {new Date(entry.createdAt).toLocaleTimeString()}
            </div>
            <div className="text-sm">{entry.content}</div>
          </div>
        ))}
        <div ref={scrollAnchorRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendChatMessage();
        }}
        className="flex gap-2 mt-4"
      >
        <input
          ref={messageInputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};
