import { useState } from 'react';
import classNames from 'classnames';

const RoomItem = ({ room, isActive, onJoin, onRename, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(room.name);

  if (isEditing) {
    return (
      <li>
        <form
          className="field room-edit"
          onSubmit={(event) => {
            event.preventDefault();

            const trimmed = name.trim();

            if (trimmed && trimmed !== room.name) {
              onRename(room.id, trimmed);
            }

            setIsEditing(false);
          }}
        >
          <input
            className="input is-small"
            value={name}
            onChange={event => setName(event.target.value)}
            autoFocus
          />
          <button className="button is-small is-success">Save</button>
        </form>
      </li>
    );
  }

  return (
    <li className={classNames('room', { 'is-active': isActive })}>
      <button
        type="button"
        className="room-name"
        onClick={() => onJoin(room.id)}
      >
        # {room.name}
      </button>

      <button
        type="button"
        className="button is-small is-white"
        title="Rename"
        onClick={() => {
          setName(room.name);
          setIsEditing(true);
        }}
      >
        ✎
      </button>

      <button
        type="button"
        className="button is-small is-white"
        title="Delete"
        onClick={() => {
          // eslint-disable-next-line no-alert
          if (window.confirm(`Delete room "${room.name}"?`)) {
            onDelete(room.id);
          }
        }}
      >
        ✕
      </button>
    </li>
  );
};

export const RoomList = ({
  rooms,
  currentRoomId,
  onJoin,
  onCreate,
  onRename,
  onDelete,
}) => {
  const [newName, setNewName] = useState('');

  return (
    <aside className="box rooms">
      <h2 className="title is-5">Rooms</h2>

      <ul className="room-list">
        {rooms.map(room => (
          <RoomItem
            key={room.id}
            room={room}
            isActive={room.id === currentRoomId}
            onJoin={onJoin}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </ul>

      <form
        className="field"
        onSubmit={(event) => {
          event.preventDefault();

          const trimmed = newName.trim();

          if (trimmed) {
            onCreate(trimmed);
            setNewName('');
          }
        }}
      >
        <input
          className="input is-small"
          placeholder="New room"
          value={newName}
          onChange={event => setNewName(event.target.value)}
        />
        <button className="button is-small is-success">Create</button>
      </form>
    </aside>
  );
};
