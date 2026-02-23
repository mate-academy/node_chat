import React from 'react'

function ChatWindow({ currentRoom, messages, onSendMessage, newMessage, onNewMessage }) {
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '15px', borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
        <h2>Room: {currentRoom}</h2>
      </header>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#fafafa' }}>
        {messages
          .filter(msg => msg.room === currentRoom || msg.author === 'System')
          .map((msg, i) => (
            <div key={i} style={{ marginBottom: '15px' }}>
              <span style={{ fontWeight: 'bold' }}>{msg.author}</span>
              <span style={{ fontSize: '10px', color: '#888', marginLeft: '10px' }}>{msg.time}</span>
              <p style={{ margin: '5px 0 0 0' }}>{msg.text}</p>
            </div>
          ))}
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid #ddd' }}>
        <form onSubmit={onSendMessage} style={{ display: 'flex' }}>
          <input type="text" placeholder={`Message #${currentRoom}`} style={{ flex: 1, padding: '10px' }} value={newMessage} onChange={(e) => onNewMessage(e.target.value)} />
          <button type="submit" style={{ padding: '10px 20px' }}>Send</button>
        </form>
      </div>
    </main>
  )
}

export default ChatWindow;
