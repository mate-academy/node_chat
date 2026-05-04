import type { SubmitEvent } from 'react';
import classNames from 'classnames';
import type { Room } from './types';

type ChatSidebarProps = {
  activeRoomName: string;
  isCreatingRoom: boolean;
  joinedRooms: Room[];
  username: string;
  onCreateRoom: (event: SubmitEvent<HTMLFormElement>) => void;
  onToggleCreateRoom: () => void;
};

function ChatSidebar({
  activeRoomName,
  isCreatingRoom,
  joinedRooms,
  username,
  onCreateRoom,
  onToggleCreateRoom,
}: ChatSidebarProps) {
  return (
    <aside className="rooms-sidebar">
      <div>
        <h1 className="chat-brand">Chat App</h1>

        <div className="rooms-heading">
          <span>Rooms</span>
          <button
            className="app-icon-button"
            type="button"
            onClick={onToggleCreateRoom}
          >
            +
          </button>
        </div>

        {isCreatingRoom ? (
          <form className="room-create-form" onSubmit={onCreateRoom}>
            <label htmlFor="sidebar-room-name">Room name</label>
            <input
              id="sidebar-room-name"
              name="roomName"
              placeholder="new-room"
            />
            <button
              className={classNames('app-button', 'primary')}
              type="submit"
            >
              create
            </button>
          </form>
        ) : null}

        <nav className="room-list">
          {joinedRooms.map((room) => (
            <a
              className={classNames('room-link', {
                active: room.name === activeRoomName,
              })}
              href={`/chat#${encodeURIComponent(room.name)}`}
              key={room.name}
            >
              <span className="room-name">
                <span>#</span>
                {room.name}
              </span>
              {room.unread ? (
                <span className="room-count">{room.unread}</span>
              ) : null}
            </a>
          ))}
        </nav>
      </div>

      <section className="current-user">
        <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
        <div>
          <strong>{username}</strong>
        </div>
      </section>
    </aside>
  );
}

export default ChatSidebar;
