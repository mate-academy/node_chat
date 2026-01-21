export const MessageList = ({ messages }) => {
  return (
    <ul>
      {messages.map((message) => {
        
        const time = new Date(message.time).toLocaleTimeString();

        return (
          <li key={message.time}>
            {/* Autor */}
            <strong>{message.author}</strong>

            {/* Horário */}
            <span style={{ marginLeft: '8px', color: '#888' }}>
              [{time}]
            </span>

            {/* Texto */}
            <div>{message.text}</div>
          </li>
        );
      })}
    </ul>
  );
};
