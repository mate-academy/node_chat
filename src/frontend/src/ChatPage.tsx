import ChatHeader from './ChatHeader';
import ChatSidebar from './ChatSidebar';
import MessageComposer from './MessageComposer';
import MessageList from './MessageList';
import useChatPage from './useChatPage';

function ChatPage() {
  const {
    activeRoom,
    activeRoomName,
    displayedMessages,
    error,
    handleCreateRoom,
    handleLeaveActiveRoom,
    handlePostMessage,
    isCreatingRoom,
    joinedRooms,
    messageText,
    setIsCreatingRoom,
    setMessageText,
    username,
  } = useChatPage();

  return (
    <main className="chat-page">
      <ChatSidebar
        activeRoomName={activeRoomName}
        isCreatingRoom={isCreatingRoom}
        joinedRooms={joinedRooms}
        username={username}
        onCreateRoom={handleCreateRoom}
        onToggleCreateRoom={() => setIsCreatingRoom((current) => !current)}
      />

      <section className="chat-shell">
        <ChatHeader
          activeRoom={activeRoom}
          onLeaveActiveRoom={handleLeaveActiveRoom}
        />
        <MessageList
          activeRoom={activeRoom}
          error={error}
          messages={displayedMessages}
          username={username}
        />
        <MessageComposer
          activeRoom={activeRoom}
          messageText={messageText}
          onMessageTextChange={setMessageText}
          onPostMessage={handlePostMessage}
        />
      </section>
    </main>
  );
}

export default ChatPage;
