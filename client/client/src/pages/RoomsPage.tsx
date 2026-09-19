import { Link } from "react-router-dom";
import type { Room } from "../types";
import { useEffect, useState } from "react";
import { createRoom, getRooms } from "../api/rooms";
import { RoomCard } from "../components/RoomCard";

export const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState<string>("");

  const loadRooms = () => {
    const roomsFromServer = getRooms();

    roomsFromServer
      .then((rooms) => setRooms(rooms))
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreateRoom = async (
    newRoomName: string,
    e: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    await createRoom({ name: newRoomName });
    loadRooms();
  };

  return (
    <div className="rooms-page">
      <header className="rooms-header">
        <Link to="/" className="back-link">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Загальний чат</span>
        </Link>
        <h1 className="rooms-title">Кімнати та групи</h1>
      </header>

      {/* Верхня панель дій: Пошук + Створення */}
      <section className="rooms-actions">
        <div className="search-box">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Пошук кімнати..."
          />
        </div>

        <form
          className="create-room-form"
          onSubmit={(e) => {
            handleCreateRoom(newRoomName, e);
          }}
        >
          <input
            type="text"
            className="create-room-input"
            placeholder="Назва нової кімнати..."
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <button
            type="submit"
            className="create-room-btn"
            disabled={newRoomName.trim().length === 0}
          >
            <span>Створити</span>
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </form>
      </section>

      {/* Список кімнат */}
      <main className="rooms-grid">
        {/* Приклад картки кімнати 1 */}
        <article className="room-card">
          <div className="room-info">
            <div className="room-avatar">#</div>
            <div>
              <h3 className="room-name">Розробка та дизайн</h3>
              <span className="room-meta">12 учасників</span>
            </div>
          </div>
          <button type="button" className="room-join-btn">
            Приєднатися
          </button>
        </article>

        {/* Приклад картки кімнати 2 */}
        <article className="room-card">
          <div className="room-info">
            <div className="room-avatar">#</div>
            <div>
              <h3 className="room-name">Флудилка</h3>
              <span className="room-meta">34 учасники</span>
            </div>
          </div>
          <button type="button" className="room-join-btn">
            Приєднатися
          </button>
        </article>
        {rooms.map((room) => {
          return <RoomCard key={room.id} room={room} />;
        })}
      </main>
    </div>
  );
};
