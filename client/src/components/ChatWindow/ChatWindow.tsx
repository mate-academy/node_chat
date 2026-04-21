import React, { useState, useEffect, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import axios from 'axios';
import cn from 'classnames';
import styles from './ChatWindow.module.scss';

type Props = {
  roomId: number;
  user: { id: number; username: string };
  setActiveRoomId: (id: number | null) => void;
  handleLogout: () => void;
};

export const ChatWindow: React.FC<Props> = ({
  roomId,
  setActiveRoomId,
  handleLogout,
  user,
}) => {
  const {
    rooms,
    messages,
    sendMessage,
    joinRoom,
    renameRoom,
    deleteRoom,
    setMessages,
  } = useChat();
  const [inputText, setInputText] = useState('');

  // Стейти для прав та редагування
  const [isMember, setIsMember] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wasRoomDeleted, setWasRoomDeleted] = useState(false);

  const userId = user.id;

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const msgRes = await axios.get(
        `http://localhost:5700/api/rooms/${roomId}/messages`,
      );
      setMessages(msgRes.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Помилка завантаження повідомлень:', err);
    }
  }, [roomId, setMessages]);

  // 2. Слідкуємо за списком кімнат
  useEffect(() => {
    if (roomId && rooms.length > 0 && !rooms.some((r) => r.id === roomId)) {
      setWasRoomDeleted(true);
    } else {
      setWasRoomDeleted(false); // Скидаємо, якщо переключилися на іншу існуючу кімнату
    }
  }, [rooms, roomId]);

  // 2. Ефект для перевірки членства при вході в кімнату
  useEffect(() => {
    const checkStatus = async () => {
      setMessages([]); // Очищуємо старе
      try {
        const res = await axios.get(
          `http://localhost:5700/api/rooms/${roomId}/membership/${userId}`,
        );
        setIsMember(res.data.isMember);

        if (res.data.isMember) {
          loadMessages(); // Завантажуємо, якщо вже учасник
          joinRoom(roomId); // Сокет підключення
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (roomId) {
      checkStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId, loadMessages, joinRoom]);

  // 3. ЕФЕКТ WS ПІДПИСКИ: Тільки ROOM_JOIN
  // useEffect(() => {
  //   if (isMember && roomId) {
  //     joinRoom(roomId);
  //   }
  // }, [roomId, isMember, joinRoom]);

  const currentRoom = rooms.find((r) => r.id === roomId);
  const isOwner = currentRoom
    ? Number(currentRoom.ownerId) === Number(userId)
    : false;

  // Функція приєднання до групи
  const handleJoinAction = async () => {
    try {
      await axios.post(`http://localhost:5700/api/rooms/${roomId}/join`, {
        userId,
      });

      // ПРЯМА ПОСЛІДОВНІСТЬ ДІЙ:
      setIsMember(true); // 1. Показуємо інтерфейс чату
      await loadMessages(); // 2. Вантажимо історію (чекаємо завершення)
      joinRoom(roomId); // Підключаємось до сокета кімнати
    } catch (err) {
      alert('Не вдалося приєднатися');
      console.log('Не вдалося приєднатися', err);
    }
  };

  // Функція збереження нової назви
  const handleRename = () => {
    if (!editName.trim()) return;
    // Відправляємо через сокет (додай функцію renameRoom у ChatContext)
    renameRoom(roomId, editName, user.id);
    setIsEditing(false);
  };

  // Функція видалення
  const handleDelete = () => {
    if (window.confirm('Ви впевнені, що хочете видалити цю кімнату?')) {
      deleteRoom(roomId, user.id);

      setActiveRoomId(null);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    sendMessage(inputText, roomId, userId);
    setInputText('');
  };

  return (
    <>
      {wasRoomDeleted ? (
        <div className={styles.deleted_overlay}>
          <h3>Кімнату було видалено 🗑️</h3>
          <p>
            Власник закрив цей чат. Будь ласка, оберіть іншу кімнату в меню
            зліва.
          </p>
          <button onClick={() => setActiveRoomId(null)}>Зрозуміло</button>
        </div>
      ) : (
        <div className={styles.chat_window}>
          <div className={styles.chat_header}>
            <div className={styles.user_area}>
              <h2>Привіт, {user.username}! Ласкаво просимо до чату</h2>
              <button onClick={handleLogout}>Вийти</button>
            </div>

            {isEditing ? (
              <div className={styles.edit_area}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
                <button onClick={handleRename}>Зберегти</button>
                <button onClick={() => setIsEditing(false)}>Скасувати</button>
              </div>
            ) : (
              <>
                <h3># {currentRoom?.name}</h3>
                {isOwner && (
                  <div className={styles.admin_controls}>
                    <button
                      className={styles.admin_button}
                      onClick={() => {
                        setIsEditing(true);
                        if (currentRoom?.name) {
                          setEditName(currentRoom.name);
                        }
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.admin_button}
                      onClick={handleDelete}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {isLoading ? (
            <h3>Завантаження повідомлень...</h3>
          ) : (
            <>
              {!isMember ? (
                <div className={styles.join_overlay}>
                  <p>Ви ще не приєдналися до цієї групи</p>
                  <button onClick={handleJoinAction}>
                    Приєднатися до групи
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.messages_list}>
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={cn(styles.message, {
                          [styles.own]: msg.userId === userId,
                        })}
                      >
                        <span className={styles.author}>{msg.authorName}</span>
                        <p className={styles.text_message}>{msg.text}</p>
                        <span className={styles.time}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.input_area}>
                    <input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend}>Відправити</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
