import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRoom, quitRoom, removeRoom, renameRoom } from "../api/rooms";
import type { Message, Room } from "../types";
import { useChat } from "../ChatContext";
import { MessageList } from "../components/MessageList";
import { MessageForm } from "../components/MessageForm";

export const RoomDetailsPage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState<Room>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRenameActivated, setIsRenameActivated] = useState<boolean>(false);
  const userName = localStorage.getItem("user");
  const navigate = useNavigate();
  const { socketRef } = useChat();

  const handleGetRoom = () => {
    if (!roomId) {
      navigate("/");
      return;
    }

    getRoom(roomId)
      .then((data) => {
        setRoom(data);
        setMessages(data.messages);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    handleGetRoom();
  }, []);

  useEffect(() => {
    const cb = (event) => {
      const result = JSON.parse(event.data);

      if (result.type === "NEW_MESSAGE") {
        const newMessage = result.data;
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    if (socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId: `${roomId}`,
          author: `${userName}`,
        }),
      );

      socketRef.current.addEventListener("message", cb);
    }

    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current?.removeEventListener("message", cb);
        socketRef.current.send(
          JSON.stringify({
            type: "JOIN_ROOM",
            roomId: "general",
            author: userName,
          }),
        );
      }
    };
  }, [roomId, socketRef, userName]);

  const [newRoomName, setNewRoomName] = useState<string>(room?.name || "");

  if (!room) {
    return <p>Завантаження даних кімнати...</p>;
  }

  const handleQuitRoom = () => {
    navigate("/rooms");
    quitRoom(room.id);
  };

  const handleDeleteRoom = () => {
    navigate("/rooms");
    removeRoom(room.id);
  };

  if (!userName) {
    return;
  }

  const user = {
    name: userName,
  };

  const isUserAdmin = room.admin?.name === user.name;

  return (
    <div className="room-details-page">
      <header className="room-details-header">
        <div className="header-left">
          <Link to="/rooms" className="back-link">
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
            <span>До всіх кімнат</span>
          </Link>

          <div className="room-heading-group">
            <div className="room-avatar-large">#</div>
            <div>
              {isRenameActivated && isUserAdmin ? (
                <input
                  type="text"
                  className="room-title"
                  value={newRoomName}
                  onChange={(e) => {
                    setNewRoomName(e.target.value);
                  }}
                  onBlur={async () => {
                    await renameRoom(room.id, newRoomName);
                    handleGetRoom();
                  }}
                />
              ) : (
                <h1 className="room-title">{room.name}</h1>
              )}
              {isUserAdmin && (
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    setIsRenameActivated((prev) => !prev);
                  }}
                >
                  edit
                  <svg
                    fill="#000000"
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 494.936 494.936"
                    xml:space="preserve"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <g>
                        <g>
                          <path d="M389.844,182.85c-6.743,0-12.21,5.467-12.21,12.21v222.968c0,23.562-19.174,42.735-42.736,42.735H67.157 c-23.562,0-42.736-19.174-42.736-42.735V150.285c0-23.562,19.174-42.735,42.736-42.735h267.741c6.743,0,12.21-5.467,12.21-12.21 s-5.467-12.21-12.21-12.21H67.157C30.126,83.13,0,113.255,0,150.285v267.743c0,37.029,30.126,67.155,67.157,67.155h267.741 c37.03,0,67.156-30.126,67.156-67.155V195.061C402.054,188.318,396.587,182.85,389.844,182.85z"></path>{" "}
                          <path d="M483.876,20.791c-14.72-14.72-38.669-14.714-53.377,0L221.352,229.944c-0.28,0.28-3.434,3.559-4.251,5.396l-28.963,65.069 c-2.057,4.619-1.056,10.027,2.521,13.6c2.337,2.336,5.461,3.576,8.639,3.576c1.675,0,3.362-0.346,4.96-1.057l65.07-28.963 c1.83-0.815,5.114-3.97,5.396-4.25L483.876,74.169c7.131-7.131,11.06-16.61,11.06-26.692 C494.936,37.396,491.007,27.915,483.876,20.791z M466.61,56.897L257.457,266.05c-0.035,0.036-0.055,0.078-0.089,0.107 l-33.989,15.131L238.51,247.3c0.03-0.036,0.071-0.055,0.107-0.09L447.765,38.058c5.038-5.039,13.819-5.033,18.846,0.005 c2.518,2.51,3.905,5.855,3.905,9.414C470.516,51.036,469.127,54.38,466.61,56.897z"></path>{" "}
                        </g>
                      </g>
                    </g>
                  </svg>
                </button>
              )}
              <span className="room-subtitle">
                {room.members.length} учасники онлайн
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="leave-room-btn"
            onClick={() => {
              handleQuitRoom();
            }}
          >
            Покинути кімнату
          </button>
          {isUserAdmin && (
            <button
              type="button"
              className="leave-room-btn"
              onClick={() => {
                handleDeleteRoom();
              }}
            >
              Видалити кімнату
            </button>
          )}
        </div>
      </header>

      {/* Основний вміст: Чат та Бічна панель учасників */}
      <div className="room-content-layout">
        {/* Контейнер для списку повідомлень та інпуту */}
        <section className="room-chat-section">
          <div className="chat-messages-placeholder">
            <MessageList messages={messages} />
          </div>
          <div className="chat-form-placeholder">
            <MessageForm />
          </div>
        </section>

        {/* Бічна панель: список учасників */}
        <aside className="room-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Учасники</h2>
            <span className="members-badge">3</span>
          </div>

          <ul className="members-list">
            <li className="member-item">
              <div className="member-avatar">S</div>
              <div className="member-info">
                <span className="member-name">Stanislav</span>
                <span className="member-role">Ви</span>
              </div>
            </li>

            <li className="member-item">
              <div className="member-avatar">A</div>
              <div className="member-info">
                <span className="member-name">Alex</span>
                <span className="member-status">online</span>
              </div>
            </li>

            <li className="member-item">
              <div className="member-avatar">O</div>
              <div className="member-info">
                <span className="member-name">Oleh</span>
                <span className="member-status">offline</span>
              </div>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
};
