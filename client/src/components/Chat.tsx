import { useEffect, useRef, useState } from 'react';
import Chat from '../services/web-chat';

interface IMessage {
  id: number;
  author: string;
  text: string;
  createdAt: string;
  userId: number | null;
  roomId: number;
}

function formatChatDate(dateInput: string | Date) {
  const date = new Date(dateInput);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  return `${hours}:${minutes} ${day}.${month}`;
}

export default function Messages({ idRoom }: { idRoom: string | null }) {
  const [messages, setMessages] = useState<IMessage[] | []>([]);
  const [text, setText] = useState('');

  const socketRef = useRef<WebSocket | null>(null);

  const handleMessage = async () => {
    try {
      const author = localStorage.getItem('user');
      if (!author || !idRoom || !socketRef.current) return;
      await Chat.createMessage(text, author, idRoom);
      socketRef.current.send(JSON.stringify({ text, author }));

      setText('');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (idRoom === null) return;

    const fetchMessages = async (id: string) => {
      try {
        const { data } = await Chat.getMessage(id);

        setMessages(data);
      } catch (e) {
        console.log(e);
      }
    };

    fetchMessages(idRoom);
  }, [idRoom]);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:5000');
    const socket = socketRef.current;

    socket.onmessage = function (event) {
      if (!event.data) return;

      let incoming;

      try {
        incoming = JSON.parse(event.data);
      } catch {
        return;
      }

      if (!incoming.text || !incoming.author) return;

      setMessages((prev) => {
        const next = [
          ...prev,
          {
            id: Date.now(),
            author: incoming.author,
            text: incoming.text,
            createdAt: new Date().toISOString(),
            userId: null,
            roomId: Number(idRoom),
          },
        ];

        return next;
      });
    };

    return () => {
      socket.close();
    };
  }, [idRoom]);

  return (
    <>
      <h3 className="mt-10">Chat: Randow talking</h3>

      <div className="w-full flex mt-10 justify-center">
        <div className=" flex items-center  gap-2  w-64">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter message..."
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
          <button
            onClick={handleMessage}
            disabled={!text.trim()}
            className="rounded bg-gray-500 px-4 py-2 text-sm text-white disabled:opacity-40 hover:bg-gray-700"
          >
            Send
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 mt-10">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {msg.author}
              </span>
              <span className="text-xs text-gray-400">
                {formatChatDate(msg.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-400">{msg.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}
