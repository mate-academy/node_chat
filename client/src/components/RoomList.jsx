import RoomItem from './RoomItem';
import React from 'react';

const RoomList = ({
  rooms,
  selectedRoom,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onAddParticipant,
}) => {
  return (
    <div>
      <div className="is-flex is-align-items-center is-justify-content-space-between mb-4">
        <h2 className="title is-5 mb-0">
          Rooms
        </h2>

        <button
          className="button is-primary is-small"
          onClick={onCreate}
        >
          + Create
        </button>
      </div>

      {rooms.length === 0 ? (
        <p className="has-text-grey">
          No rooms yet.
        </p>
      ) : (
        <ul>
          {rooms.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              selected={selectedRoom?.id === room.id}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              onAddParticipant={onAddParticipant}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoomList;
