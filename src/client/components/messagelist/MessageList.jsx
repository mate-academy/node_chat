export const MessageList = ({ messages }) => {
  return (
    <div className="message__chat">
      <ul className="message__list">
        {messages.map((me, index) => {
          console.log('Mensagem recebida:', me);

          return (
            <li key={me.timeStamp || index}>
              <span>{me.time}</span>
              <strong>{`${me.author} say: ${me.message}`}</strong>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
