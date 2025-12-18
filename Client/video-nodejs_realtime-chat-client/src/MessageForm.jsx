import { useState } from 'react';

import { messageService } from './services/messageService.ts';
import { useAuth } from './components/AuthProvider.tsx';




export const MessageForm = ({  roomId}) => {
  const [text, setText] = useState('');
const {  currentUser } = useAuth();
  return (
    <form
      className="field is-horizontal"
      onSubmit={async (event) => {
        event.preventDefault();
        
      await messageService.sendMessage(text,roomId,currentUser.id)
        
        setText('');
      }}
    >
      <input
        type="text"
        className="input"
        placeholder="Enter a message"
        value={text}
        onChange={event => setText(event.target.value)}
      />
      <button className="button"
      disabled = {text.length===0}>Send</button>
    </form>
  );
};
