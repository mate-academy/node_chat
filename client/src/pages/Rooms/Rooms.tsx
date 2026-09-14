import { useState } from 'react';
import { useWebSocket } from '../../WebSocketContext.tsx';
import RoomElement from './RoomElement.tsx';
import type { RoomMessage } from '../../types/RoomMessage.ts';

export const ROOM_MIN_LENGTH = 4;

const Rooms: React.FC = () => {
  const { rooms, messages, sendMessage } = useWebSocket();
  const [canAddRoom, setCanAddRoom] = useState<boolean>(false);
  const joinedRooms = messages.map((roomMessages) => roomMessages.title);
  console.log('joinedRooms', joinedRooms);

  const handleAddRoom = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = formData.get('title')?.toString().trim() || '';
    if (!title) return;

    const message: RoomMessage = {
      type: 'rooms',
      command: 'add',
      room: title,
    };

    sendMessage(message);

    form.reset();
  };

  const handleRoomInput = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const newRoom = e.target.value.trim();
    if (newRoom.length < ROOM_MIN_LENGTH) {
      setCanAddRoom(false);
      return;
    }

    setCanAddRoom(!rooms.some((room) => room === newRoom));
  };

  return (
    <>
      <section className="panel">
        <p className="panel-heading">Rooms</p>
        <div className="panel-block">
          <div className="control has-icons-left">
            <form onSubmit={handleAddRoom} className="field is-horizontal">
              <div className="field">
                <div className="control">
                  <input
                    id="title"
                    name="title"
                    className="input"
                    type="text"
                    placeholder="Enter room name"
                    onChange={handleRoomInput}
                  />
                </div>
              </div>
              <div className="field">
                <div className="control">
                  <button
                    type="submit"
                    className="button is-success"
                    disabled={!canAddRoom}
                  >
                    Add room
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        {rooms.map((room) => (
          <RoomElement
            key={room}
            title={room}
            canJoin={!joinedRooms.includes(room)}
          />
        ))}
      </section>
    </>
  );
};

export default Rooms;
