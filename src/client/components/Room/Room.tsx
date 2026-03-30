import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

import styles from './Room.module.scss';
import { useChat } from '../ChatContext';

import { MessageForm } from './MessageForm';
import { MessageList } from './MessageList';

export const Room = () => {
  const { roomId } = useParams();
  const { selectedRoom, getRoom, sendMessage, currentUser } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    getRoom(roomId || '');
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    sendMessage({
      type: 'subscribe',
      roomId,
      userId: currentUser.id,
    });

    return () => {
      sendMessage({
        type: 'unsubscribe',
        roomId,
      });
    };
  }, [roomId]);

  return (
    <>
      {selectedRoom && (
        <div className={styles.room}>
          <div className={styles.room_header}>
            <div>
              <p className="title is-5">{selectedRoom.name}</p>
              <span className="subtitle is-7">
                {selectedRoom.users.length} member
                {selectedRoom.users.length > 1 && 's'}
              </span>
            </div>

            <div
              className={styles.change_button}
              onClick={() => navigate('settings')}
              title="Room settings"
            >
              <i className="icon fa-solid fa-ellipsis-vertical fa-l" />
            </div>
          </div>

          <MessageList />

          <MessageForm />
        </div>
      )}
      <Outlet />
    </>
  );
};
