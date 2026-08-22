import { useCallback, useEffect, useState } from 'react';
import { socket } from '../api/socket';
import type { Invitation } from '../types/Invitation';
import { InvitationCard } from './InvitationCard';
import { PlusIcon } from './PlusIcon';

interface Props {
  rooms: string[];
  currentRoom: string | null;
  onRoomSelect: (room: string) => void;
  onAddRoom: (room: string) => void;
  className: string;
}

export const Rooms: React.FC<Props> = ({
  rooms,
  currentRoom,
  onRoomSelect,
  onAddRoom,
  className,
}) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [room, setRoom] = useState('');

  useEffect(() => {
    const handleInvite = (invitation: Invitation) => {
      setInvitations((curInvitations) => {
        if (curInvitations.some((inv) => inv.room === invitation.room)) {
          return curInvitations;
        }
        return [...curInvitations, invitation];
      });
    };

    socket.on('RoomInviteReceived', handleInvite);

    return () => {
      socket.off('RoomInviteReceived', handleInvite);
    };
  }, []);

  const applyInvitation = useCallback(
    (room: string) => {
      socket.emit('JoinToRoom', { room });

      onAddRoom(room);
      setInvitations((curInvitations) =>
        curInvitations.filter((invitation) => invitation.room !== room),
      );
    },
    [onAddRoom],
  );

  const rejectInvitation = useCallback((room: string) => {
    setInvitations((curInvitations) =>
      curInvitations.filter((invitation) => invitation.room !== room),
    );
  }, []);

  return (
    <div className={`${className} flex flex-col`}>
      {invitations.length > 0 && (
        <div className="overflow-y-auto shrink-0 p-1">
          {invitations.map((invitation) => (
            <InvitationCard
              key={invitation.room}
              invitation={invitation}
              applyInvitation={applyInvitation}
              rejectInvitation={rejectInvitation}
            />
          ))}
        </div>
      )}
      <div className="overflow-y-auto flex-1">
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => onRoomSelect(room)}
            className={`${currentRoom === room ? 'elements-accent-color' : 'secondary-color'} border-slate-700 h-14 flex items-center w-full gap-5 border-b cursor-pointer px-2`}
          >
            <svg width="50" height="50">
              <circle r="25" cx="25" cy="25" fill="currentColor" />
            </svg>
            <h3>{room}</h3>
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAddRoom(room);
          setRoom('');
        }}
        className="w-full shrink-0 flex justify-between p-1 border-t gap-2 secondary-color"
      >
        <input
          type="text"
          value={room}
          placeholder="Add new group"
          onChange={(e) => setRoom(e.target.value)}
          className="elements-text-accent-color text-md w-full outline-none rounded-md px-3 py-2 focus:outline-slate-600"
        />
        <button className="shrink-0 rounded-full w-10 h-10 cursor-pointer flex items-center justify-center elements-text-accent-color">
          <PlusIcon />
        </button>
      </form>
    </div>
  );
};
