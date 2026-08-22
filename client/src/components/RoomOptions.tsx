import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { Modal } from './Modal';

interface Props {
  onDeleteRoom: (roomToDelete: string) => void;
  onRenameRoom: (name: string, newName: string) => void;
  onAddUserToRoom: (room: string, username: string) => void;
  currentRoom: string;
}

export const RoomOptions: React.FC<Props> = ({
  onDeleteRoom,
  currentRoom,
  onRenameRoom,
  onAddUserToRoom,
}) => {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [isManageGroupOpen, setIsManageGroupOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [room, setRoom] = useState(currentRoom);
  const [username, setUsername] = useState('');

  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsContextMenuOpen(false);
      }
    };

    if (isContextMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isContextMenuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="cursor-pointer flex justify-center items-center"
        onClick={() => setIsContextMenuOpen(true)}
      >
        <EllipsisHorizontalIcon className="w-6" />
      </button>
      {isContextMenuOpen && (
        <div className="w-31 absolute -right-2 elements-color rounded-md py-1">
          <button
            onClick={() => {
              setIsContextMenuOpen(false);
              setIsManageGroupOpen(true);
            }}
            className="cursor-pointer w-full px-4 py-1 text-sm text-left elements-color-hover transition-colors text-white"
          >
            Manage group
          </button>
          <button
            onClick={() => {
              setIsContextMenuOpen(false);
              setIsAddUserOpen(true);
            }}
            className="cursor-pointer w-full px-4 py-1 text-sm text-left elements-color-hover transition-colors text-white"
          >
            Add User
          </button>
          <button
            onClick={() => {
              onDeleteRoom(currentRoom);
              setIsContextMenuOpen(false);
            }}
            className="cursor-pointer w-full px-4 py-1 text-sm text-left elements-color-hover transition-colors text-white"
          >
            Delete
          </button>
        </div>
      )}

      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add User"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAddUserToRoom(currentRoom, username);
            setIsAddUserOpen(false);
          }}
          className=" w-full shrink-0 flex justify-between p-2 border-t gap-2 "
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="text-md w-full outline-none mx-3 my-2 border-b-2"
          />
          <button className="elements-accent-color rounded-2xl cursor-pointer flex items-center justify-center px-3">
            Add
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isManageGroupOpen}
        onClose={() => setIsManageGroupOpen(false)}
        title="Edit group"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onRenameRoom(currentRoom, room);
            setIsManageGroupOpen(false);
          }}
          className="w-full shrink-0 flex justify-between p-2 border-t gap-2 "
        >
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="text-md w-full outline-none mx-3 my-2 border-b-2"
          />
          <button className="elements-accent-color rounded-2xl cursor-pointer flex items-center justify-center px-3">
            Rename
          </button>
        </form>
      </Modal>
    </div>
  );
};
