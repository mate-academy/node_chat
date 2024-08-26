import React, { useEffect, useRef, useState } from 'react';
import * as Types from '../../types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { roomService } from '../../services/roomService';

interface RoomProps {
  room: Types.Room;
  selectedRoom: Types.Room | null;
  setSelectedRoom: (value: Types.Room) => void;
}

const Room: React.FC<RoomProps> = ({ room, selectedRoom, setSelectedRoom }) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(room.name);
  const inputNameRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleDelete = async (id: string) => {
    await roomService.removeOne(id);
  };

  const handleNameSave = () => {
    const trimmedName = name.trim();

    if (trimmedName !== room.name) {
      if (!trimmedName) {
        handleDelete(room.id);

        return;
      }

      roomService
        .updateName(room.id, trimmedName)
        .then(() => {
          setName(name);
          setEditMode(false);
        })
        .catch(() => inputNameRef.current?.focus());
    } else {
      setEditMode(false);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setEditMode(false);
    } else if (event.key === 'Enter') {
      handleNameSave();
    }
  };

  useEffect(() => {
    if (editMode) {
      inputNameRef.current?.focus();
    }
  }, [editMode]);

  useEffect(() => {
    if (editMode) {
      document.addEventListener('keyup', handleKeyUp);

      return () => {
        document.removeEventListener('keyup', handleKeyUp);
      };
    }

    return;
  });

  return (
    <div
      className={`p-4 rounded-lg cursor-pointer flex justify-between items-center ${
        selectedRoom?.id === room.id ? 'bg-blue-500 text-white' : 'bg-gray-300'
      }`}
      onClick={() => setSelectedRoom(room)}
    >
      {editMode ? (
        <form onSubmit={(event) => event.preventDefault()}>
          <input
            ref={inputNameRef}
            type="text"
            className=""
            placeholder="Empty item will be deleted"
            value={name}
            onBlur={handleNameSave}
            onChange={(e) => handleNameChange(e)}
          />
        </form>
      ) : (
        <>
          <span>{name}</span>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the room click event
                setEditMode(true);
              }}
              className="ml-2 p-1 rounded-full bg-gray-400 hover:bg-gray-500"
            >
              <PencilIcon className="h-5 w-5 text-white" />
            </button>
            <button
              className="p-1 rounded-full bg-red-600 hover:bg-gray-500"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(room.id);
              }}
            >
              <TrashIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Room;
