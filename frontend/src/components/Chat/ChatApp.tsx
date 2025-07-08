import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatApp.module.scss';
import ChatConversation from '../ChatConversation/ChatConversation';
import ChatList from '../ChatList/ChatList';
import DiscoverableChatDropdown from '../DiscoverableChatDropdown/DiscoverableChatDropdown';
import { useUserStore } from '../../store/store';
import { io, Socket } from 'socket.io-client';
import { type Message } from '../../types/types';
import { useParams } from 'react-router-dom';

const SOCKET_URL = import.meta.env.SERVER_API_URL || 'http://localhost:3007';

const ChatApp: React.FC = () => {
  const {
    user,
    logout,
    userChats,
    discoverableChats,
    selectedChat,
    messages,
    setSelectedChat,
    fetchUserChats,
    fetchDiscoverableChats,
    addMessage,
    createChat,
    joinChat,
    setUser,
  } = useUserStore();
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { userId } = useParams();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Promise.all([fetchUserChats(), fetchDiscoverableChats()]);

        await setUser(userId);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();

    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    const handleReceiveMessage = (message: Message) => {
      addMessage(message);
    };

    socketRef.current.on('receive_message', handleReceiveMessage);

    return () => {
      socketRef.current?.off('receive_message', handleReceiveMessage);
      socketRef.current?.disconnect();
    };
  }, [addMessage, fetchDiscoverableChats, fetchUserChats, setUser, userId]);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket || !userChats.length) return;

    userChats.forEach((userChat) => {
      socket.emit('join_chat', userChat.chat.id);
    });
  }, [userChats]);

  const handleSendMessage = (content: string) => {
    if (!socketRef.current || !selectedChat || !user) return;

    socketRef.current.emit('send_message', {
      chatId: selectedChat.id,
      senderId: user.id,
      content,
    });
  };

  const handleCreateChat = async (name: string) => {
    try {
      await createChat(name);
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  };

  const handleJoinChat = async (chatId: string) => {
    try {
      await joinChat(chatId);
    } catch (error) {
      console.error('Failed to join chat:', error);
      throw error;
    }
  };

  return (
    <div className={styles['chat-app']}>
      <nav className={styles['chat-app__navbar']}>
        <div className={styles['chat-app__user-display']}>
          Hello, <strong>{user?.name || 'Guest'}</strong>!
        </div>
        <div className={styles['chat-app__nav-buttons']}>
          <button
            className={styles['chat-app__discover-button']}
            onClick={() => setIsDiscoverOpen(true)}
          >
            Discover Chats
          </button>
          <button
            onClick={logout}
            className={styles['chat-app__logout-button']}
          >
            Logout
          </button>
        </div>
      </nav>
      <main className={styles['chat-app__main-content']}>
        <ChatList
          chats={userChats.map((uc) => uc.chat)}
          selectedChatId={selectedChat?.id || null}
          onSelectChat={setSelectedChat}
          onCreateNewChat={handleCreateChat}
        />
        {selectedChat ? (
          <ChatConversation
            key={selectedChat.name}
            messages={messages}
            currentUser={user}
            onSendMessage={handleSendMessage}
            currentChatName={selectedChat.name}
          />
        ) : (
          <div className={styles['chat-app__placeholder']}>
            <h2 className={styles['chat-app__placeholder-text']}>
              Select a chat to start messaging or create a new one!
            </h2>
          </div>
        )}
      </main>
      {isDiscoverOpen && (
        <DiscoverableChatDropdown
          chats={discoverableChats}
          onJoinChat={handleJoinChat}
          onClose={() => setIsDiscoverOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatApp;
