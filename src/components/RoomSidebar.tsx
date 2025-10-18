import React from "react";

type Room = {
  id: string;
  name: string;
};

type Props = {
  rooms: Room[];
  currentRoomId: string | null;
  onSelectRoom: (id: string) => void;
  onCreateRoom: () => void;
  onRenameRoom: (id: string, newName: string) => void; // NOVO
  onDeleteRoom: (id: string) => void; // NOVO
};

export default function RoomSidebar({
  rooms,
  currentRoomId,
  onSelectRoom,
  onCreateRoom,
  onRenameRoom,
  onDeleteRoom,
}: Props) {
  const handleRenameClick = (room: Room) => {
    const next = prompt("Novo nome da sala:", room.name);
    if (next && next.trim() && next.trim() !== room.name) {
      onRenameRoom(room.id, next.trim());
    }
  };

  const handleDeleteClick = (room: Room) => {
    onDeleteRoom(room.id);
  };

  return (
    <aside
      style={{
        width: 320,
        borderRight: "1px solid #eee",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
        <h3 style={{ margin: 0 }}>Salas</h3>
        <button
          style={{ marginTop: 8, width: "100%" }}
          onClick={onCreateRoom}
        >
          + Nova sala
        </button>
      </div>

      <div style={{ overflowY: "auto", padding: 8 }}>
        {rooms.length === 0 && (
          <p style={{ color: "#777", padding: 8 }}>Nenhuma sala ainda.</p>
        )}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {rooms.map((room) => {
            const selected = room.id === currentRoomId;
            return (
              <li
                key={room.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 8,
                  alignItems: "center",
                  padding: 8,
                  borderRadius: 8,
                  background: selected ? "#f0f6ff" : "transparent",
                  border: selected ? "1px solid #cfe0ff" : "1px solid transparent",
                  marginBottom: 6,
                }}
              >
                <button
                  onClick={() => onSelectRoom(room.id)}
                  style={{
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: selected ? 600 : 500,
                  }}
                  title="Selecionar sala"
                >
                  {room.name}
                </button>

                <button
                  onClick={() => handleRenameClick(room)}
                  aria-label={`Renomear ${room.name}`}
                  title="Renomear"
                >
                  Renomear
                </button>

                <button
                  onClick={() => handleDeleteClick(room)}
                  aria-label={`Excluir ${room.name}`}
                  title="Excluir"
                  style={{ color: "#b00020" }}
                >
                  Excluir
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
