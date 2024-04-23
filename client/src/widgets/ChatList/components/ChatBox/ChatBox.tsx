import { useEffect } from "react";
import { Stack } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "../../../../shared/hooks/reduxHooks";
import { getRecipient } from "../../../../entities/Chat";
import { readMessage } from '../../../../entities/Message';
import { getAll } from '../../../../entities/Message';
import { SendMessage } from "../../../../features/SendMessage";
import { MessageList } from "../MessageList/MessageList";

export const ChatBox = () => {
  const dispatch = useAppDispatch();
  const { currentChat } = useAppSelector(state => state.chats);
  const { messages, error } = useAppSelector(state => state.messages);
  const { user } = useAppSelector(state => state.user);
  let recipient;

  const markAsRead = () => {
    if (!currentChat) return;

    const recipient = getRecipient(currentChat, user);

    if (recipient) {
      readMessage(currentChat?.id, recipient.id)
    }
  }

  useEffect(() => {
    if (!currentChat) return;

    dispatch(getAll(currentChat.id))
      .then(() => markAsRead())

  }, [currentChat])

  if (currentChat) {
    recipient = getRecipient(currentChat, user)
  }

  if (!currentChat) {
    return (
      <p style={{ textAlign: 'center', width: '100%' }}>
        No conversation selected yet
      </p>
    )
  }

  return (
    <Stack gap={4} className="chat-box">
      <div className="chat-header">
        {recipient
          ? (<strong>{recipient?.name}</strong>)
          : (<strong>Chose recipient</strong>)
        }
      </div>

      {error && (
        <p style={{ margin: 'auto', backgroundColor: 'red', paddingInline: '5px' }}>
          {error}
        </p>
      )}

      <MessageList messages={messages} />
      <SendMessage />
    </Stack >
  );
}