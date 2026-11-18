import { useState } from 'react';
import './MessageForm.scss';

type Props = {
  onSend: (text: string) => void;
};

export const MessageForm = ({ onSend }: Props) => {
  const [text, setText] = useState('');

  return (
    <form
      className="message-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText('');
      }}
    >
      <input
        className="message-form__input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Напиши повідомлення"
        aria-label="Повідомлення"
      />
      <button className="message-form__button">Надіслати</button>
    </form>
  );
};
