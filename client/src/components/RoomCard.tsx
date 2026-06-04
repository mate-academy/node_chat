import { useState } from 'react';

interface RoomCardProps {
  id: string;
  name: string;
  membersCount?: number;
  onJoin: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export const RoomCard = ({
  id,
  name,
  membersCount = 0,
  onJoin,
  onDelete,
  onRename,
}: RoomCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);

  const handleRename = () => {
    if (!newName.trim() || newName === name) {
      setIsEditing(false);
      return;
    }
    onRename(id, newName.trim());
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col justify-between rounded border border-gray-200 p-4 w-56 gap-4">
      {/* Top */}
      <div className="flex flex-col gap-1">
        {isEditing ? (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            onBlur={handleRename}
            className="rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-500"
          />
        ) : (
          <h3 className="text-sm font-medium text-white">{name}</h3>
        )}
        <span className="text-xs text-gray-400">{membersCount} members</span>
      </div>

      {/* Bottom */}
      <div className="flex gap-2">
        <button
          onClick={() => onJoin(id)}
          className="flex-1 rounded bg-gray-800 py-1.5 text-xs text-white hover:bg-gray-700"
        >
          Join
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
        >
          Rename
        </button>
        <button
          onClick={() => onDelete(id)}
          className="rounded border border-red-200 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50"
        >
          Delete
        </button>
        <p className='text-[10px]'>id:{id}</p>
      </div>
    </div>
  );
};
