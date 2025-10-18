import { useState } from 'react';

type Room = { id: string; name: string };

export default function RoomSidebar({
  rooms,
  currentRoomId,
  onSelectRoom,
  onCreateRoom,
  username,
}: {
  rooms: Room[];
  currentRoomId: string;
  onSelectRoom: (id: string) => void;
  onCreateRoom: (name: string) => void;
  username: string;
}) {
  const [newRoom, setNewRoom] = useState('');

  const disabled = !newRoom.trim();

  return (
    <aside
      style={{
        borderRight: '1px solid #e5e7eb',
        padding: 16,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Salas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectRoom(r.id)}
              style={{
                textAlign: 'left',
                padding: '8px 10px',
                borderRadius: 6,
                border:
                  r.id === currentRoomId
                    ? '1px solid #3b82f6'
                    : '1px solid #e5e7eb',
                background: r.id === currentRoomId ? '#eff6ff' : '#fff',
                cursor: 'pointer',
              }}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* >>>>>>> VERSÃO ADAPTADA: bloqueia submit vazio e dá feedback visual */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const clean = newRoom.trim();
          if (!clean) return;
          onCreateRoom(clean);
          setNewRoom('');
        }}
        style={{ display: 'flex', gap: 8, marginTop: 'auto' }}
      >
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="Nova sala..."
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
          }}
        />
        <button
          type="submit"
          disabled={disabled}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #3b82f6',
            background: disabled ? '#bfdbfe' : '#3b82f6',
            color: 'white',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          Criar
        </button>
      </form>

      <div style={{ fontSize: 12, color: '#6b7280' }}>
        Logado como: <strong>{username}</strong>
      </div>
    </aside>
  );
}
