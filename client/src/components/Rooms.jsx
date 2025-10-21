'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreVertical } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import './styles.css';
import { createRoom, deleteRoom, fetchRooms, updateRoom } from '../api/rooms';

export default function Rooms() {
  const [newRoom, setNewRoom] = useState('');
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editedName, setEditedName] = useState('');

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
  });

  const handleJoinRoom = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      setNewRoom('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteRoom(id),
    onSuccess: () => queryClient.invalidateQueries(['rooms']),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }) => updateRoom(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      setEditingRoomId(null);
      setEditedName('');
    },
  });

  const startEditing = (id, currentName) => {
    setEditingRoomId(id);
    setEditedName(currentName);
  };

  const saveEdit = (id) => {
    if (editedName.trim()) {
      renameMutation.mutate({ id, name: editedName.trim() });
    } else {
      setEditingRoomId(null);
      setEditedName('');
    }
  };

  if (isLoading) return <p>Loading rooms...</p>;

  return (
    <div className="rooms-container">
      <div className="rooms-card">
        <div className="rooms-header">
          <h1 className="rooms-title">Choose a Room</h1>
          <p className="rooms-description">
            Join an existing room or create a new one
          </p>
        </div>

        <div className="room-list">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="room-item flex justify-between items-center"
            >
              {editingRoomId === room.id ? (
                <input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={() => saveEdit(room.id)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(room.id)}
                  className="border p-1 rounded flex-1"
                  autoFocus
                />
              ) : (
                <span
                  className="room-name cursor-pointer flex-1"
                  onClick={() => handleJoinRoom(room.id)}
                >
                  {room.name}
                </span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="room-menu-button p-1 hover:bg-gray-200 rounded">
                    <MoreVertical />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => startEditing(room.id, room.name)}
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="!text-red-600"
                    onClick={() => deleteMutation.mutate(room.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        <div className="new-room-form">
          <input
            type="text"
            placeholder="New room name"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            className="new-room-input"
          />
          <button
            onClick={() => createMutation.mutate(newRoom)}
            className="new-room-button"
            disabled={!newRoom.trim() || createMutation.isLoading}
          >
            {createMutation.isLoading ? 'Adding...' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}
