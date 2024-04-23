import { useEffect, useState } from "react";
import { ChatList } from "../../../../widgets/ChatList";
import { useAppDispatch, useAppSelector } from "../../../../shared/hooks/reduxHooks";
import { updateUsersOnline } from "../../../../entities/Socket";
import { getRecipient } from "../../../../entities/Chat";
import { addMessage, getAll as getAllMessages, getUnread } from "../../../../entities/Message";
import { getChats } from "../../../../entities/Chat";

export const ChatPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.user);
  const { newMessage } = useAppSelector(state => state.messages)
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { currentChat, chats } = useAppSelector(state => state.chats);

  const connectWebSocket = () => {
    const newSocket = new WebSocket("ws://localhost:3000");
    setSocket(newSocket);
  };

  useEffect(() => {
    connectWebSocket()
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.onopen = () => {
      console.log('Connection open');

      const message = {
        event: 'connection',
        userId: user?.id,
      };

      socket.send(JSON.stringify(message))
    };

    socket.onclose = () => {
      console.log('Connection closed');
      connectWebSocket();
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'onlineUsers':
          dispatch(updateUsersOnline(data.onlineUsers));
          break;

        case 'message':
          if (user) {
            const chatIds = chats.map(el => el.id);
            dispatch(getUnread({ userId: user.id, chatIds }));
          }

          dispatch(addMessage(data.message))
          break;

        case 'readMessages':
          if (currentChat && user) {
            if (currentChat.id === +data.chatId) {
              dispatch(getAllMessages(currentChat.id));
              dispatch(getChats(user.id))
            }
          }
          break;
      }
    }

    socket.onerror = (event) => {
      console.log('SocketError', event)
    }

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket?.close();
      }
    }
  }, [socket, currentChat, chats]);

  useEffect(() => {
    if (!socket || !currentChat || socket.readyState !== WebSocket.OPEN) return;

    const recipient = getRecipient(currentChat, user);
    const message = {
      event: 'messageSend',
      recipient,
      message: newMessage,
    };

    socket.send(JSON.stringify(message));
  }, [newMessage])


  return (
    <div>
      <ChatList />
    </div>
  )
}
