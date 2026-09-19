import { Link } from "react-router-dom";
import { useChat } from "../ChatContext";
import { MessageForm } from "../components/MessageForm";
import { MessageList } from "../components/MessageList";

export const GeneralChatPage = () => {
  const { messages } = useChat();
  return (
    <>
      <header className="header">
        <h2>General Chat</h2>
        <Link className="message-bubble--own link" to={"/rooms"}>
          Rooms
        </Link>
      </header>
      <MessageForm />
      <MessageList messages={messages} />
    </>
  );
};
