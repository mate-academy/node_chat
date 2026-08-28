import { useState } from 'react';

export function RoomItem({ room, active, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(room.name);

  function saveRename(event) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (trimmed && trimmed !== room.name) onRename(room.id, trimmed);
    setEditing(false);
  }

  if (editing) {
    return (
      <form onSubmit={saveRename} className="px-2 py-1">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={saveRename}
          className="w-full rounded-lg border border-indigo-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </form>
    );
  }

  return (
    <div
      className={`group flex items-center gap-1 rounded-xl px-3 py-2 transition ${
        active ? 'bg-indigo-500 text-white' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <button
        onClick={() => onSelect(room.id)}
        className="flex-1 truncate text-left text-sm font-medium"
        title={room.name}
      >
        # {room.name}
      </button>

      <button
        onClick={() => {
          setDraft(room.name);
          setEditing(true);
        }}
        className={`opacity-0 transition group-hover:opacity-100 ${
          active ? 'hover:text-indigo-100' : 'hover:text-indigo-600'
        }`}
        title="Rename"
      >
        ✏️
      </button>

      <button
        onClick={() => {
          if (confirm(`Delete room "${room.name}"?`)) onDelete(room.id);
        }}
        className="opacity-0 transition group-hover:opacity-100 hover:scale-110"
        title="Delete"
      >
        🗑️
      </button>
    </div>
  );
}
