import { useState, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { ChatList } from './ChatList';
import { HeaderComponent } from './HeaderComponent';
import * as Types from '../types/types';
import { roomService } from '../services/chatServise';
import CreateNewChatModal from './CreateNewChatModal';

const ChatApp = () => {
  const [chats, setChats] = useState<Types.Chat[]>([]);
  // const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [selectedChat, setSelectedChat] = useState<Types.Chat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    roomService.getAll().then(setChats).catch(console.error);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChatCreated = (newChat: Types.Chat) => {
    setChats((prevChats) => [...prevChats, newChat]);
    // setSelectedChatId(newChat.id);
    setSelectedChat(newChat);
  };

  const handleSelectChat = (chat: Types.Chat) => {
    // setSelectedChatId(chatId);
    setSelectedChat(chat);
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
    } catch (error) {
      console.error('Помилка видалення чату:', error);
    }
  };

  return (
    <div className="container is-fluid">
      <HeaderComponent
        onOpenCreateNewChatModal={openModal}
        selectedChatName={selectedChat ? selectedChat.name : null}
      />
      <div className="columns is-gapless is-fullheight">
        <ChatList
          chats={chats}
          onSelectChat={handleSelectChat}
          onRenameChat={handleRenameChat}
          onExitChat={handleExitChat}
          onDeleteChat={handleDeleteChat}
        />
        <div className="column is-flex is-justify-content-center is-align-items-center">
          {selectedChat && <ChatWindow chatId={selectedChat?.id} />}
        </div>
      </div>
      <CreateNewChatModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};

export default ChatApp;
