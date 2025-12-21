import { useState } from 'react';
import { messageService } from '../services/messageService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Outlet, useParams } from 'react-router-dom';


function sendMessage(author, text, roomId) {
  return messageService.send(author, text, roomId);
}

export const MessageForm = () => {
  const { roomId } = useParams();
  const [text, setText] = useState('');
  const { userName } = useAuth()

  return (
    <>
      <a href="/" className='button mb-3'>Go back</a>
      <form
        className="field is-horizontal"
        onSubmit={async (event) => {
          event.preventDefault();

          await sendMessage(userName, text, roomId);

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
        <button className="button">Send</button>
      </form>
      <Outlet />
    </>
  );
};
