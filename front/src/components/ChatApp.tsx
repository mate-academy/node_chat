import { useState, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { ChatList } from './ChatList';
import { HeaderComponent } from './HeaderComponent';
import * as Types from '../types/types';
import { roomService } from '../services/chatServise';
import CreateNewChatModal from './CreateNewChatModal';

const ChatApp = () => {
  const [chats, setChats] = useState<Types.Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Types.Chat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<
    Record<number, Set<number>>
    >({});
  const [editingChat, setEditingChat] = useState<Types.Chat | null>(null);
  const [usersOfChat, setUsersOfChat] = useState<number[]>([]);

  useEffect(() => {
    roomService.getAll().then(setChats).catch(console.error);
  }, []);

  useEffect(() => {
    if (editingChat) {
      roomService.getUsersOfChat(editingChat.id).then(setUsersOfChat).catch(console.error);
    }
  }, [editingChat]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleOpenModalToEditChat = (chat: Types.Chat) => {
    setEditingChat(chat);
    openModal();
  }

  const handleChatUpdated = (updatedChat: Types.Chat) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === updatedChat.id ? updatedChat : chat
      )
    );
    setSelectedChat(updatedChat);
  };

  const handleChatCreated = (newChat: Types.Chat) => {
    setChats((prevChats) => [...prevChats, newChat]);
    setSelectedChat(newChat);
  };

  const handleSelectChat = (chat: Types.Chat) => {
    setSelectedChat(chat);
    setUnreadMessages((prevState) => {
      const newUnreadMessages = { ...prevState };
      if (newUnreadMessages[chat.id]) {
        delete newUnreadMessages[chat.id];
      }
      return newUnreadMessages;
    });
  };

  const handleRenameChat = async (chatId: number) => {
    const newName = prompt('Введіть нову назву чату:');
    if (newName) {
      try {
        await roomService.renameChat(newName, chatId);
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, name: newName } : chat,
          ),
        );
      } catch (error) {
        console.error('Помилка перейменування:', error);
      }
    }
  };

  const handleExitChat = async (chatId: number) => {
    try {
      await roomService.exitFromChat(chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    } catch (error) {
      console.error('Помилка виходу з чату:', error);
    }
  };

  const handleDeleteChat = async (chatId: number) => {
    try {
      await roomService.deleteChat(chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      setUnreadMessages((prevState) => {
        const newUnreadMessages = { ...prevState };
        if (newUnreadMessages[chatId]) {
          delete newUnreadMessages[chatId];
        }
        return newUnreadMessages;
      });
    } catch (error) {
      console.error('Помилка видалення чату:', error);
    }
  };

  const handleNewMessage = (chatId: number, messageId: number) => {
    setUnreadMessages((prevState) => {
      const newUnreadMessages = { ...prevState };
      if (!newUnreadMessages[chatId]) {
        newUnreadMessages[chatId] = new Set();
      }
      newUnreadMessages[chatId].add(messageId);
      return newUnreadMessages;
    });
  };

  return (
    <div className="container is-fluid">
      <HeaderComponent
        onOpenCreateNewChatModal={openModal}
        selectedChatName={selectedChat ? selectedChat.name : null}
      />
      <div className="columns is-gapless is-fullheight">
        <ChatList
          selectedChatId={selectedChat ? selectedChat.id : null}
          setSelectedChat={setSelectedChat}
          chats={chats}
          setChats={setChats}
          unreadMessages={unreadMessages}
          setUnreadMessages={setUnreadMessages}
          handleNewMessage={handleNewMessage}
          onSelectChat={handleSelectChat}
          onExitChat={handleExitChat}
          onDeleteChat={handleDeleteChat}
          handleOpenModalToEditChat={handleOpenModalToEditChat}
        />
        <div className="column is-flex is-justify-content-center is-align-items-center">
          {selectedChat && <ChatWindow chatId={selectedChat?.id} />}
        </div>
      </div>
      <CreateNewChatModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onChatCreated={handleChatCreated}
        onChatUpdated={handleChatUpdated}
        editingChat={editingChat}
        usersOfChat={usersOfChat}
        setEditingChat={setEditingChat}
      />
    </div>
  );
};

export default ChatApp;
