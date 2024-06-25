import { Textarea, Button } from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';
import { messages } from './data.json';

import './App.scss';

function App() {
  const [listOfMessage, setListOfMessage] = useState(messages);
  const newMessageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000');

    socket.addEventListener('message', (e) => {
      const newMessage = {
        id: messages[messages.length - 1].id + 1,
        text: JSON.parse(e.data),
        createDate: new Date(Date.now()).toISOString(),
      };

      setListOfMessage((prevState) => [...prevState, newMessage]);
    });
  }, []);

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault();

    if (newMessageRef && newMessageRef.current && newMessageRef.current.value.trimStart()) {
      const newMessage = {
        id: messages[messages.length - 1].id + 1,
        text: newMessageRef.current.value,
        createDate: new Date(Date.now()).toISOString(),
      };

      setListOfMessage((prevState) => [...prevState, newMessage]);
      newMessageRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-x-[20px]">
        <Textarea
          ref={newMessageRef}
          name="chatMessage"
          onKeyDown={handleKeyDown}
          id="chatMessage"
          rows={2}
          className="bg-slate-600 px-[20px] py-[10px] resize-none w-[500px] text-[20px] rounded-[10px]"
        />
        <Button
          type="submit"
          className="rounded-[10px] h-[40px] self-end bg-sky-600 py-2 px-4 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
        >
          Send
        </Button>
      </form>
      <ul className="mt-[50px] flex flex-col gap-[10px] items-center">
        {listOfMessage.map((message) => (
          <li key={message.id} className="bg-slate-600 rounded-[10px] w-fit">
            <p className="px-[20px] py-[10px]">{message.text}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
