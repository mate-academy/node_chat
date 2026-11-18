import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api } from '../api';
import { socket } from '../socket';
import type { LiveMessage, Message, Room } from '../types';

interface Props {
  room: Room;
  username: string;
}

interface SendResponse {
  ok: boolean;
  error?: string;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

export function ChatWindow({ room, username }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadError, setLoadError] = useState('');
  const [text, setText] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const join = () => {
      socket.emit('join_room', room.id);

      api
        .getMessages(room.id)
        .then((history) => {
          setLoadError('');
          // Keep live messages that arrived while the history was loading
          setMessages((prev) => {
            const ids = new Set(history.map((m) => m.id));

            return [...history, ...prev.filter((m) => !ids.has(m.id))];
          });
        })
        .catch(() => setLoadError('Could not load messages'));
    };

    const handleNewMessage = (message: LiveMessage) => {
      if (message.roomId !== room.id) {
        return;
      }

      setMessages((prev) =>
        prev.some((m) => m.id === message.id) ? prev : [...prev, message],
      );
    };

    join();
    socket.on('connect', join);
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('connect', join);
      socket.off('new_message', handleNewMessage);
      socket.emit('leave_room', room.id);
    };
  }, [room.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  const handleSend = (event: FormEvent) => {
    event.preventDefault();

    const trimmed = text.trim();

    if (!trimmed || sending) {
      return;
    }

    if (!socket.connected) {
      setSendError('Not connected to the server');
      return;
    }

    setSending(true);
    setSendError('');

    socket
      .timeout(5000)
      .emit(
        'send_message',
        { roomId: room.id, username, text: trimmed },
        (error: Error | null, response?: SendResponse) => {
          setSending(false);

          if (error || !response) {
            setSendError('No response from the server');
            return;
          }

          if (!response.ok) {
            setSendError(response.error ?? 'Failed to send message');
            return;
          }

          setText('');
        },
      );
  };

  return (
    <div className="chat-window">
      <div className="chat-header">{room.name}</div>

      <div className="messages">
        {loadError && <p className="error">{loadError}</p>}
        {messages.length === 0 && !loadError && (
          <p className="muted">No messages yet</p>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={message.author === username ? 'message mine' : 'message'}
          >
            <div className="message-meta">
              <strong>{message.author}</strong>
              <span>{formatTime(message.createdAt)}</span>
            </div>
            <div className="message-text">{message.text}</div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <form className="message-form" onSubmit={handleSend}>
        <input
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setSendError('');
          }}
          placeholder="Type a message"
          maxLength={1000}
          autoFocus
        />
        <button type="submit" disabled={sending}>
          Send
        </button>
      </form>

      {sendError && <p className="error send-error">{sendError}</p>}
    </div>
  );
}
