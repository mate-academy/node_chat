import { useEffect, useRef, useState } from 'react';

export function Room({
  room,
  editOpportunity,
  messages,
  socket,
  setSelectedRoom,
}) {
  const [text, setText] = useState('');
  const [newRoomName, setNewRoomName] = useState('');

  const inputRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleMessageSend = () => {
    if (!text.trim()) return;

    socket.send(
      JSON.stringify({
        type: 'new-message',
        payload: { text },
      }),
    );
    setText('');
    inputRef.current.focus();
  };

  const handleDeleteRoom = (roomName) => {
    socket.send(
      JSON.stringify({
        type: 'delete-room',
        payload: { name: roomName },
      }),
    );

    setSelectedRoom('');
  };

  const handleRenameRoom = (newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === room) return;

    socket.send(
      JSON.stringify({
        type: 'rename-room',
        payload: { oldName: room, newName: trimmed },
      }),
    );

    setSelectedRoom(newName);
    setNewRoomName('');
  };

  return (
    <div className="flex-1">
      <h1 className="text-2xl font-bold">
        Room: <span className="text-blue-500">{room}</span>
      </h1>
      {editOpportunity && (
        <div className="flex justify-between mb-4">
          <div>
            <input
              value={newRoomName}
              onChange={(e) => {
                setNewRoomName(e.target.value);
              }}
              className="border p-2 w-100 rounded mr-2"
              placeholder="New room name"
            />
            <button
              className="text-lg text-yellow-600 hover:underline"
              onClick={() => handleRenameRoom(newRoomName)}
            >
              Rename the room
            </button>
          </div>
          <button
            className="text-lg text-red-600 hover:underline"
            onClick={() => handleDeleteRoom(room)}
          >
            Delete the room
          </button>
        </div>
      )}
      <div className="border rounded p-4 h-96 overflow-y-scroll bg-white">
        {messages.map((msg) => (
          <div key={msg.time} className="mb-2">
            <div className="text-sm text-gray-600">
              {msg.author} • {new Date(msg.time).toLocaleTimeString()}
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        action="#"
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleMessageSend();
        }}
      >
        <input
          ref={inputRef}
          className="border p-2 rounded flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}
