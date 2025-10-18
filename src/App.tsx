import { useEffect, useMemo, useRef, useState } from 'react';
import RoomSidebar from './components/RoomSidebar';
import MessageList from './components/MessageList';
import MessageForm from './components/MessageForm';

type Room = { id: string; name: string };
export type Message = {
  id: string;
  roomId: string;
  author: string;
  text: string;
  time: string;
};

const API_BASE = '/api'; // via proxy do Vite para http://localhost:3000
const WS_URL = (() => {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.hostname;
  const port = 3000; // backend
  return `${proto}://${host}:${port}/ws`;
})();

export default function App() {
  const [username, setUsername] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string>('general');

  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Mensagens da sala atual
  const messages = useMemo(
    () =>
      allMessages
        .filter((m) => m.roomId === currentRoomId)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [allMessages, currentRoomId],
  );

  // Login simples
  useEffect(() => {
    if (username) return;
    const name = window.localStorage.getItem('node_chat_username') || '';
    if (name) {
      setUsername(name);
    } else {
      const input = window.prompt('Digite seu nome de usuário:')?.trim();
      if (input) {
        fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: input }),
        })
          .then((r) => (r.ok ? r.json() : { username: input }))
          .then(({ username: u }) => {
            setUsername(u || input);
            window.localStorage.setItem('node_chat_username', u || input);
          })
          .catch(() => {
            setUsername(input);
            window.localStorage.setItem('node_chat_username', input);
          });
      } else {
        setUsername('guest');
        window.localStorage.setItem('node_chat_username', 'guest');
      }
    }
  }, [username]);

  // Carregar salas
  useEffect(() => {
    fetch(`${API_BASE}/rooms`)
      .then((r) => r.json())
      .then((data: Room[]) => setRooms(data))
      .catch((e) => console.error('rooms error', e));
  }, []);

  // Carregar histórico da sala atual
  useEffect(() => {
    if (!currentRoomId) return;
    setLoadingMessages(true);
    fetch(`${API_BASE}/rooms/${currentRoomId}/messages`)
      .then((r) => {
        if (!r.ok) throw new Error('load messages failed');
        return r.json();
      })
      .then((data: Message[]) => {
        setAllMessages((prev) => {
          const others = prev.filter((m) => m.roomId !== currentRoomId);
          const seen = new Set<string>(data.map((m) => m.id));
          const othersFiltered = others.filter((m) => !seen.has(m.id));
          return [...othersFiltered, ...data];
        });
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingMessages(false));
  }, [currentRoomId]);

  // Conectar WebSocket (uma única conexão)
  useEffect(() => {
    if (wsRef.current) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.addEventListener('open', () => console.log('WS connected'));

    ws.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === 'message' && msg?.payload) {
          setAllMessages((prev) =>
            prev.some((m) => m.id === msg.payload.id)
              ? prev
              : [...prev, msg.payload as Message],
          );
        }
      } catch {}
    });

    ws.addEventListener('close', () => {
      console.log('WS closed');
      wsRef.current = null;
    });

    return () => {
      try {
        ws.close();
      } catch {}
      wsRef.current = null;
    };
  }, []);

  // >>>>>>> VERSÃO ADAPTADA: valida antes, exibe erro real do backend
  async function handleCreateRoom(name: string) {
    const clean = name.trim();
    if (!clean) {
      alert('Informe um nome para a sala');
      return;
    }
    const id = clean.toLowerCase().replace(/\s+/g, '-');
    if (rooms.some((r) => r.id === id)) {
      alert('room exists');
      return;
    }

    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: clean }),
    });

    if (!res.ok) {
      let msg = 'Erro ao criar sala';
      try {
        const j = await res.json();
        if (j?.error) msg = j.error; // "name required" ou "room exists"
      } catch {}
      alert(msg);
      return;
    }

    const room: Room = await res.json();
    setRooms((prev) => [...prev, room]);
    setCurrentRoomId(room.id);
  }

  async function handleSendMessage(text: string) {
    if (!text.trim()) return;
    const payload = {
      roomId: currentRoomId,
      author: username || 'guest',
      text,
    };
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || 'Erro ao enviar mensagem');
      return;
    }
    const msg: Message = await res.json();
    setAllMessages((prev) =>
      prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
    );
  }

  return (
    <div
      data-testid="app-root"
      className="app-container"
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        height: '100vh',
      }}
    >
      <RoomSidebar
        rooms={rooms}
        currentRoomId={currentRoomId}
        onSelectRoom={setCurrentRoomId}
        onCreateRoom={handleCreateRoom}
        username={username}
      />
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <header
          style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}
        >
          <strong>Sala:</strong> {currentRoomId} &nbsp; | &nbsp;{' '}
          <strong>Usuário:</strong> {username}
        </header>
        <MessageList messages={messages} loading={loadingMessages} />
        <MessageForm onSend={handleSendMessage} />
      </div>
    </div>
  );
}
