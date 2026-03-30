import type React from 'react';

interface Props {
  id: string;
  name: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export const RoomItem: React.FC<Props> = ({
  id,
  name,
  isActive,
  onSelect,
  onDelete,
  onRename,
}) => {
  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();

    const newName = window.prompt('Enter a new room name:', name);

    if (newName && newName.trim() !== '') {
      onRename(id, newName.trim());
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete the room? "${name}"?`)) {
      onDelete(id);
    }
  };
  return (
    <li
      onClick={() => onSelect(id)}
      className={`room-item ${isActive ? 'active' : ''}`}
    >
      <span>{name}</span>
      <div>
        <button type="button" onClick={handleRename}>
          Rename
        </button>
        <button type="button" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </li>
  );
};
