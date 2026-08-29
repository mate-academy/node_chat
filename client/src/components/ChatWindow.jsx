import { MessageList } from './MessageList';
import { MessageForm } from './MessageForm';

export function ChatWindow({ room, messages, username, onSendMessage }) {
  if (!room) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-100">
        <div className="text-center text-slate-400">
          <p className="font-medium">Pick a room to start chatting</p>
          <p className="text-sm">or create a new one on the left</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h2 className="font-bold text-slate-800"># {room.name}</h2>
      </header>

      <MessageList messages={messages} username={username} />

      <MessageForm onSend={onSendMessage} />
    </main>
  );
}
