import { useState } from 'react';
import type { Room } from '../../types';
import './RoomList.scss';

type Props = {
  rooms: Room[];
  currentId: string;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string) => void;
  onRemove: (id: string) => void;
};

export const RoomList = ({
  rooms,
  currentId,
  onSelect,
  onCreate,
  onRemove,
  onRename,
}: Props) => {
  const [name, setName] = useState('');

  return (
    <aside className="rooms">
      <h2 className="rooms__title">Кімнати</h2>

      <ul className="rooms__list">
        {rooms.map((room) => {
          const isActive = room.id === currentId;

          return (
            <li
              key={room.id}
              className={`rooms__item ${isActive ? 'rooms__item--active' : ''}`}
            >
              <button
                className="rooms__select"
                onClick={() => !isActive && onSelect(room.id)}
                aria-current={isActive ? 'true' : undefined}
                title={room.name}
              >
                {room.name}
              </button>

              <div className="rooms__actions">
                <button
                  className="rooms__action"
                  onClick={() => onRename(room.id)}
                  aria-label={`Перейменувати ${room.name}`}
                  title="Перейменувати"
                >
                  ✎
                </button>
                {room.id !== 'general' && (
                  <button
                    className="rooms__action rooms__action--danger"
                    onClick={() => onRemove(room.id)}
                    aria-label={`Видалити ${room.name}`}
                    title="Видалити"
                  >
                    ✕
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <form
        className="rooms__form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          onCreate(name.trim());
          setName('');
        }}
      >
        <input
          className="rooms__input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Нова кімната"
          aria-label="Назва нової кімнати"
        />
        <button className="rooms__add" aria-label="Створити кімнату">
          +
        </button>
      </form>
    </aside>
  );
};
