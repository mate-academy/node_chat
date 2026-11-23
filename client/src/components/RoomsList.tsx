import { useState, type FormEvent } from 'react';
import type { Room } from '../types/room';
import { useWebSocket } from '../context/hooks';
import { useAppSelector } from '../store/hooks';

export const RoomsList = () => {
  const socket = useWebSocket();
  const rooms = useAppSelector((state) => state.rooms.rooms);

  const [roomName, setRoomName] = useState('');

  function handleCreateRoom(event: FormEvent) {
    event.preventDefault();

    const name = roomName.trim();

    if (!name || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: 'CREATE_ROOM',
        name,
      }),
    );

    setRoomName('');
  }

  function handleJoinRoom(room: Room) {
    if (!room || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: 'JOIN_ROOM',
        roomId: room.id,
      }),
    );
  }

  return (
    <>
      <hr />

      <h2 className="subtitle">Available rooms</h2>

      {rooms.length === 0 ? (
        <p className="has-text-grey mb-4">
          No rooms available. Create a new one!
        </p>
      ) : (
        <div>
          {rooms.map((room) => (
            <div
              key={room.id}
              className="box is-flex is-justify-content-space-between is-align-items-center"
            >
              <div>
                <p className="has-text-weight-bold">{room.name}</p>

                <p className="is-size-7 has-text-grey">
                  Owner: {room.owner.name}
                </p>

                <p className="is-size-7 has-text-grey">
                  Members: {room.membersCount}
                </p>
              </div>

              <button
                className="button is-primary"
                onClick={() => handleJoinRoom(room)}
              >
                Join
              </button>
            </div>
          ))}
        </div>
      )}

      <hr />

      <h2 className="subtitle">Create a room</h2>

      <form onSubmit={handleCreateRoom}>
        <div className="field has-addons">
          <div className="control is-expanded">
            <input
              className="input"
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
            />
          </div>

          <div className="control">
            <button
              className="button is-primary"
              type="submit"
              disabled={!socket || !roomName.trim()}
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </>
  );
};
