import React, { useMemo, useState } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

function Chat({socket, userName, room}) {
  const [currMessage, setCurrMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currMessage) {
      const messageData = {
        room: room,
        author: userName,
        message: currMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

        await socket.emit("send_message", messageData);
        setMessageList((list) => [...list, messageData]);
        setCurrMessage('');
    }
  };

  useMemo(() => {
    socket.on('receive_message', (data) => {
      setMessageList((list) => [...list, data]);
    })
  }, [socket]);

  return (
    <div className='chat-window'>
      <div className="chat-header">
        <p>Room: {room}</p>
      </div>
      <div className='chat-body'>
        <ScrollToBottom className='message-container'>
          {messageList.map((messageContent) => {
            return (
              <div className='message' id={userName === messageContent.author ? 'you' : 'other'}>
                <div>
                  <div className='message-content'>
                    <p>{messageContent.message}</p>
                  </div>
                  <div className='message-meta'>
                    <p id='author'>{messageContent.author}</p>
                    <p id='time'>{messageContent.time}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </ScrollToBottom>
      </div>
      <div className='chat-footer'>
        <input
          type='text'
          value={currMessage}
          placeholder='Hey...'
          onChange={(e) => {
            setCurrMessage(e.target.value);
          }}
          onKeyPress={(e) => {
            e.key === 'Enter' && sendMessage();
          }}
         />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  )
}

export default Chat
