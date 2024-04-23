import { useState } from "react";
import { Stack } from "react-bootstrap"
import InputEmojiWithRef from "react-input-emoji"
import { useAppDispatch, useAppSelector } from "../../../../shared/hooks/reduxHooks";
import { Message, send } from "../../../../entities/Message";


export const SendMessage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.user);
  const { currentChat } = useAppSelector(state => state.chats);
  const { error } = useAppSelector(state => state.messages);

  const [text, setText] = useState('');

  const sendMessage = async () => {
    if (!user || !currentChat) return;

    const message: Message = {
      author: user?.name,
      text,
      chatId: currentChat.id,
      userId: user.id,
      date: '',
      read: false,
    };

    await dispatch(send(message));

    if (!error) {
      setText('');
    }
  }

  return (
    <Stack direction="horizontal" gap={3} className="chat-input flex-grow-0">
      <InputEmojiWithRef
        value={text}
        onChange={setText}
        fontFamily="nunito"
        borderColor="rgba(72, 112, 223, 0.2"
        shouldReturn={false}
        shouldConvertEmojiToImage={false}
      />
      <button
        className="send-btn"
        onClick={sendMessage}
      >
        <img src="icons/sendIcon.svg" alt="send" />
      </button>
    </Stack>
  )
}
