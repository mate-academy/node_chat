import { useState } from 'react';
import { useWebSocket } from '../WebSocketContext.tsx';
import cn from 'classnames';
import type { Room, Rooms, RoomMessages } from '../WebSocketContext.tsx';

const Chats: React.FC = () => {
  const { userName, messages, sendMessage, isConnected } = useWebSocket();
  const [activeRoom, setActiveRoom] = useState<Room>('General');
  const rooms: Rooms = messages.map((currRoom) => {
    return currRoom.title;
  });

  const roomMessages =
    messages.find(
      (currentRoomMessages: RoomMessages) =>
        currentRoomMessages.title === activeRoom,
    )?.messages || [];

  const handleSendMessage = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const message = formData.get('message')?.toString().trim() || '';
    if (message) {
      sendMessage({
        type: 'message',
        room: activeRoom,
        author: userName,
        text: message,
      });

      form.reset();
    }
  };

  const handleTabClick = (
    room: Room,
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    // Intercept default anchor browser navigation
    event.preventDefault();
    setActiveRoom(room);
  };

  return (
    <>
      <section className="panel">
        <p className="panel-heading">Chats</p>
        <p className="panel-tabs">
          {rooms.map((room) => (
            <a
              key={room}
              className={cn({ 'is-active': room === activeRoom })}
              role="tab"
              onClick={(e) => handleTabClick(room, e)}
            >
              {room}
            </a>
          ))}
        </p>
        <div className="panel-block">
          <div className="control has-icons-left">
            <form onSubmit={handleSendMessage} className="field is-horizontal">
              <div className="field has-addons">
                <div className="control">
                  <input
                    className="input"
                    id="message"
                    name="message"
                    type="text"
                    placeholder="Text message"
                  />
                </div>
                <div className="control">
                  <button
                    type="submit"
                    className="button is-success"
                    disabled={!isConnected}
                  >
                    ⏎
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        {roomMessages.map((msg, index) => (
          <p key={`${msg.time}-${msg.author}-${index}`} className="panel-block">
            <strong className="pr-3">{msg.author}</strong>
            <span className="pr-3 is-family-monospace has-text-weight-light">
              [{new Date(msg.time).toLocaleTimeString()}]:
            </span>{' '}
            {msg.text}
          </p>
        ))}
      </section>
    </>
  );
};

export default Chats;
