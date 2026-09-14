import { useState } from 'react';
import { ROOM_MIN_LENGTH } from './Rooms.tsx';
import { useWebSocket } from '../../WebSocketContext.tsx';

interface Props {
  title: string;
  canJoin: boolean;
}

type states = 'edit' | 'show';

const RoomElement: React.FC<Props> = ({ title, canJoin }) => {
  const { rooms, sendMessage } = useWebSocket();
  const [state, setState] = useState<states>('show');
  const [value, setValue] = useState(title);
  const [canChange, setCanChange] = useState(false);

  const handleValueChange = (
    event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const value = event.target.value.trim();

    setValue(value);

    if (value === title) {
      return setCanChange(false);
    }

    if (value.length < ROOM_MIN_LENGTH) {
      return setCanChange(false);
    }

    if (rooms.includes(value)) {
      return setCanChange(false);
    }

    setCanChange(true);
  };

  const handleSave = () => {
    sendMessage({
      type: 'rooms',
      command: 'rename',
      room: title,
      newTitle: value,
    });
  };

  const handleDelete = () => {
    sendMessage({
      type: 'rooms',
      command: 'delete',
      room: title,
    });
  };

  const handleJoin = () => {
    sendMessage({
      type: 'rooms',
      command: 'join',
      room: title,
    });
  };

  return (
    <div className="panel-block is-flex is-justify-content-space-between">
      {state === 'edit' ? (
        <input
          className="input "
          type="text"
          value={value}
          onChange={handleValueChange}
        ></input>
      ) : (
        <span>{title}</span>
      )}

      {state === 'show' && (
        <div className="field is-grouped">
          <button
            className="button is-warning"
            title="rename"
            onClick={() => setState('edit')}
          >
            ✎
          </button>
          <button
            className="button is-info"
            title="join"
            onClick={handleJoin}
            disabled={!canJoin}
          >
            🔗
          </button>
          <button
            className="button is-danger"
            title="delete"
            onClick={handleDelete}
          >
            🗑
          </button>
        </div>
      )}
      {state === 'edit' && (
        <div className="field is-grouped ml-2">
          <button
            className="button is-success"
            title="rename"
            onClick={handleSave}
            disabled={!canChange}
          >
            💾
          </button>
          <button
            className="button"
            title="cancel"
            onClick={() => setState('show')}
          >
            🗙
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomElement;
