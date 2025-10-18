import { useEffect, useMemo, useState, useCallback } from "react";
import RoomSidebar from "./components/RoomSidebar";
import MessageList from "./components/MessageList";
import MessageForm from "./components/MessageForm";

type Room = {
  id: string;
  name: string;
};

type Message = {
  id: string;
  text: string;
  userName: string;
  createdAt: string;
  roomId: string;
};

const API = "/api";

export default function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // --- carregamento inicial de salas
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/rooms`);
        if (!res.ok) throw new Error("Falha ao carregar salas");
        const data: Room[] = await res.json();
        setRooms(data);
        // se não houver sala selecionada, seleciona a primeira
        if (!currentRoomId && data.length > 0) {
          setCurrentRoomId(data[0].id);
        }
      } catch (e) {
        console.error(e);
        alert("Não foi possível carregar as salas.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentRoom = useMemo(
    () => rooms.find((r) => r.id === currentRoomId) ?? null,
    [rooms, currentRoomId]
  );

  // --- carregar mensagens da sala atual (com tratamento de 404)
  const loadRoomMessages = useCallback(
    async (roomId: string) => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`${API}/rooms/${roomId}/messages`);
        if (res.status === 404) {
          // sala não existe mais no servidor
          alert("A sala selecionada não existe mais. Seleção foi limpa.");
          setCurrentRoomId(null);
          setMessages([]);
          return;
        }
        if (!res.ok) throw new Error("Falha ao carregar mensagens");
        const data: Message[] = await res.json();
        setMessages(data);
      } catch (e) {
        console.error(e);
        alert("Não foi possível carregar as mensagens da sala.");
      } finally {
        setLoadingMessages(false);
      }
    },
    []
  );

  useEffect(() => {
    if (currentRoomId) {
      loadRoomMessages(currentRoomId);
    } else {
      setMessages([]);
    }
  }, [currentRoomId, loadRoomMessages]);

  // --- criar sala (já existia? mantenho exemplo)
  const handleCreateRoom = async () => {
    const name = prompt("Nome da nova sala:");
    if (!name) return;
    try {
      const res = await fetch(`${API}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Falha ao criar sala");
      const created: Room = await res.json();
      setRooms((prev) => [...prev, created]);
      setCurrentRoomId(created.id);
    } catch (e) {
      console.error(e);
      alert("Não foi possível criar a sala.");
    }
  };

  // --- NOVO: renomear sala
  const handleRenameRoom = async (id: string, newName: string) => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`${API}/rooms/${id}`, {
        method: "PATCH", // servidor já expõe PATCH /rooms/:id
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const msg = await safeText(res);
        throw new Error(msg || "Falha ao renomear sala");
      }
      // otimismo simples: atualiza estado local
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name: newName.trim() } : r))
      );
    } catch (e) {
      console.error(e);
      alert("Não foi possível renomear a sala.");
    }
  };

  // --- NOVO: excluir sala
  const handleDeleteRoom = async (id: string) => {
    const room = rooms.find((r) => r.id === id);
    const confirmMsg = `Excluir a sala "${room?.name ?? id}"? Esta ação não pode ser desfeita.`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API}/rooms/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const msg = await safeText(res);
        throw new Error(msg || "Falha ao excluir sala");
      }

      setRooms((prev) => prev.filter((r) => r.id !== id));

      if (currentRoomId === id) {
        // escolhe uma sala fallback (primeira restante) ou limpa seleção
        const remaining = rooms.filter((r) => r.id !== id);
        const next = remaining[0]?.id ?? null;
        setCurrentRoomId(next);
        if (next) {
          await loadRoomMessages(next);
        } else {
          setMessages([]);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Não foi possível excluir a sala.");
    }
  };

  const handleSelectRoom = (id: string) => setCurrentRoomId(id);

  // enviar mensagem (exemplo simples)
  const handleSendMessage = async (text: string) => {
    if (!currentRoomId) return;
    try {
      const res = await fetch(`${API}/rooms/${currentRoomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Falha ao enviar mensagem");
      const saved: Message = await res.json();
      setMessages((prev) => [...prev, saved]);
    } catch (e) {
      console.error(e);
      alert("Não foi possível enviar a mensagem.");
    }
  };

  return (
    <div className="app" style={{ display: "flex", height: "100vh" }}>
      <RoomSidebar
        rooms={rooms}
        currentRoomId={currentRoomId}
        onSelectRoom={handleSelectRoom}
        onCreateRoom={handleCreateRoom}
        onRenameRoom={handleRenameRoom}
        onDeleteRoom={handleDeleteRoom}
      />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ padding: 12, borderBottom: "1px solid #eee" }}>
          <strong>
            {currentRoom ? `Sala: ${currentRoom.name}` : "Nenhuma sala selecionada"}
          </strong>
        </header>

        <section style={{ flex: 1, overflow: "auto" }}>
          {loadingMessages ? (
            <p style={{ padding: 12 }}>Carregando mensagens…</p>
          ) : (
            <MessageList messages={messages} />
          )}
        </section>

        <footer style={{ borderTop: "1px solid #eee", padding: 8 }}>
          <MessageForm
            disabled={!currentRoomId}
            onSubmit={handleSendMessage}
          />
        </footer>
      </main>
    </div>
  );
}

async function safeText(res: Response) {
  try {
    const txt = await res.text();
    return txt;
  } catch {
    return "";
  }
}
