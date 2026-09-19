import { useMemo } from "react";
import type { Room } from "../types";
import { Link, useNavigate } from "react-router-dom";
import { joinRoom } from "../api/rooms";
import { isUserInTheRoom } from "../utils";
import { useChat } from "../ChatContext";

interface Props {
  room: Room;
}

export const RoomCard: React.FC<Props> = ({ room }) => {
  const { currentUser } = useChat();
  const navigate = useNavigate();

  const isUserJoined = useMemo(() => {
    if (!currentUser) {
      return;
    }
    const user = {
      name: currentUser,
    };

    return isUserInTheRoom(room, user);
  }, [currentUser]);

  const handleJoin = async () => {
    try {
      await joinRoom(room.id);
      navigate(`/rooms/${room.id}`);
    } catch (error) {
      console.error("Не вдалося приєднатися:", error);
    }
  };

  return (
    <article className="room-card">
      <div className="room-info">
        <div className="room-avatar">#</div>
        <div>
          <h3 className="room-name">{room.name}</h3>
          <span className="room-meta">{room.members.length} учасників</span>
        </div>
      </div>
      {isUserJoined ? (
        <Link to={`/rooms/${room.id}`} className="room-join-btn">
          Переглянути
        </Link>
      ) : (
        <button
          type="button"
          className="room-join-btn"
          onClick={() => {
            handleJoin();
          }}
        >
          Приєднатися
        </button>
      )}
    </article>
  );
};
