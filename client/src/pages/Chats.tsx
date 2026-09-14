import { useEffect, useState } from 'react';
import { useWebSocket } from '../WebSocketContext.tsx';
import cn from 'classnames';
import type {
  Room,
  Message,
  Rooms,
  RoomMessages,
} from '../WebSocketContext.tsx';

const Chats: React.FC = () => {
  const { userName, messages, sendMessage } = useWebSocket();
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room>('General');
  const rooms: Rooms = messages.map((currRoom) => {
    return currRoom.title;
  });

  useEffect(() => {
    const foundRoomMessages = messages.find(
      (roomMessages: RoomMessages) => roomMessages.title === activeRoom,
    )?.messages;

    setRoomMessages(foundRoomMessages || []);
  }, [messages, activeRoom]);

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
                    placeholder="Input name first"
                  />
                </div>
                <div className="control">
                  <button type="submit" className="button is-success ">
                    ⏎
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        {roomMessages.map((msg) => (
          <p key={msg.time} className="panel-block">
            <strong className="pr-3">{msg.author}:</strong>
            {msg.text}
          </p>
        ))}
      </section>
    </>
  );
};

export default Chats;
