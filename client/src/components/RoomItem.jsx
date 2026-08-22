import React from "react";

const RoomItem = ({
  room,
  selected,
  onSelect,
  onRename,
  onDelete,
  onAddParticipant,
}) => {
  return (
    <li>
      <div
        className={`box p-3 mb-2 ${selected ? 'has-background-link-light' : ''
          }`}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelect(room)}
      >
        <div className="is-flex is-align-items-center is-justify-content-space-between">
          <span
            className={
              selected ? 'has-text-link has-text-weight-bold' : ''
            }
          >
            {room.name}
          </span>

          <div
            className="buttons are-small mb-0"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="button is-light"
              onClick={() => onRename(room)}
              title="Rename"
            >
              ✎
            </button>

            <button
              className="button is-info is-light"
              onClick={() => onAddParticipant(room)}
              title="Add participant"
            >
              +
            </button>

            <button
              className="button is-danger is-light"
              onClick={() => onDelete(room)}
              title="Delete"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default RoomItem;
