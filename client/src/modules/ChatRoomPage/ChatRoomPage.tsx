import { Columns, Container, Heading } from 'react-bulma-components';
import { useLocation } from 'react-router-dom';
import { RoomUsers } from '../../components/RoomUsers';
import { MessagesBox } from '../../components/MessagesBox/MessagesBox';
import { NewMessage } from '../../components/NewMessage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { type Message } from '../../types/messagesResponce';
import { getMassesges } from '../../api/messages/messages';
import { getUserByIdBulk } from '../../api/users/users';
import { ModalLoader } from '../../components/ModalLoader';
import { ModalError } from '../../components/ModalError';
import * as chatroomActions from '../../features/chatRooms';

interface IncomingMessage {
  type: string;
  payload: string | string[] | Message;
}

export const ChatRoomPage = () => {
  const dispatch = useAppDispatch();
  const { rooms } = useAppSelector((state) => state.chatRooms);
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const roomName = location.pathname.split('/').slice(-1)[0];
  const [roomUsers, setRoomUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  // const [currentUserId] = useState<number | undefined>(user?.id);
  // const [currentRoomId] = useState<number | undefined>(
  const currentUserId = user?.id;
  const currentRoomId = rooms.find((room) => room.name === roomName)?.id;

  // Create WebSocket connection.
  const socketRef = useRef<WebSocket | null>(null);

  function handleCreateMessage(message: string) {
    if (currentRoomId && currentUserId) {
      const newMessage: Omit<Message, 'id' | 'createdAt'> = {
        roomId: currentRoomId,
        userId: currentUserId,
        text: message,
      };

      const socket = socketRef.current;
      if (socket) {
        socket.send(
          JSON.stringify({
            type: 'create',
            payload: { ...newMessage },
          })
        );
      }
    }
  }

  const getAllMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMassesges(roomName);
      if (res?.data) {
        setMessages(res.data as Message[]);
      }
    } catch (e) {
      handleErrors((e as AxiosError) || Error);
      setLoading(false);
    }
    setLoading(false);
  }, [roomName]);

  const getAllRoomUsers = useCallback(() => {
    dispatch(chatroomActions.actions.setUsers([]));

    const curUsersInRoomIds = messages.reduce((acc: number[], cur) => {
      if (!acc.includes(cur.userId)) {
        acc.push(cur.userId);
      }
      return acc;
    }, []);

    getUserByIdBulk(curUsersInRoomIds)
      .then((res) => {
        if (res?.data) {
          dispatch(chatroomActions.actions.setUsers(res.data));
        }
      })
      .catch((e: AxiosError | Error) => handleErrors(e))
      .finally(() => {});
  }, [messages, dispatch]);

  useEffect(() => {
    getAllRoomUsers();
  }, [messages, getAllRoomUsers]);

  useEffect(() => {
    getAllMessages();
    getAllRoomUsers();

    socketRef.current = new WebSocket('ws://localhost:5700'); // Store instance in ref

    const socket = socketRef.current;
    if (!socket) {
      // eslint-disable-next-line no-console
      console.error('WebSocket is not initialized');
      return;
    }

    socket.onopen = () => {
      const joinMessage = JSON.stringify({
        type: 'join',
        payload: { roomId: currentRoomId, userId: currentUserId },
      });
      socket.send(joinMessage);
    };

    socket.onmessage = (event: MessageEvent<string | ArrayBuffer>) => {
      handleWsIncomingMessage(event);
    };

    const effectCleanup = () => {
      if (socket) {
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close(1000, `Leaving room ${roomName}`);
        }

        if (socketRef.current === socket) {
          socketRef.current = null;
        }
      }
    };

    return effectCleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, currentRoomId, currentUserId]);

  function handleWsIncomingMessage(event: MessageEvent<string | ArrayBuffer>) {
    let newMessage;
    if (typeof event.data === 'string') {
      newMessage = JSON.parse(event.data) as IncomingMessage;
    } else {
      // eslint-disable-next-line no-console
      console.error('Received non-string data from WebSocket:', event.data);
      return;
    }

    switch (newMessage.type) {
      case 'newMessage':
        setMessages((prev) => {
          return [newMessage.payload as Message, ...prev];
        });
        break;

      case 'userJoin':
        setRoomUsers((prev) => {
          const newUsers = newMessage.payload as string[];
          return Array.from(new Set([...prev, ...newUsers]));
        });

        break;

      case 'userLeft':
        setRoomUsers((prev) => {
          return prev.filter((user) => user !== (newMessage.payload as string));
        });

        break;

      case 'error':
        setError('Error Occured');
        break;

      default:
        // eslint-disable-next-line no-console
        console.error('Received not valid data from WebSocket:', event.data);
        break;
    }
  }

  function handleErrors(error: AxiosError | Error) {
    if (error instanceof AxiosError) {
      setError(String(error.message));
    } else {
      setError('Unexpected Error Occured');
    }
  }

  if (!currentRoomId || !currentUserId) {
    return <h1>Error Occured, contact administarator</h1>;
  }

  return (
    <>
      <ModalLoader isActive={!!loading} />
      <ModalError
        title="Error"
        body={error}
        isActive={!!error}
        onClose={() => setError('')}
      />
      <Container
        className=" is-flex is-flex-direction-column p-3"
        style={{ height: '100%' }}
      >
        <Heading className="has-text-centered"> {roomName}</Heading>

        <Columns className="is-flex  is-flex-grow-1">
          <Columns.Column
            size={4}
            className="is-flex is-flex-direction-column is-hidden-mobile"
          >
            <RoomUsers users={roomUsers} />
          </Columns.Column>

          <Columns.Column className="is-flex is-flex-direction-column">
            <MessagesBox messagesData={messages.reverse()} />
          </Columns.Column>
        </Columns>

        <div className="mb-5">
          <NewMessage onAction={handleCreateMessage} />
        </div>
      </Container>
    </>
  );
};
