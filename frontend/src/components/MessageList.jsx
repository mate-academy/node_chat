export const MessageList = ({ messages }) => {
  const normilizeTime = (date) => {
    const indexT = date.indexOf('T');
    const indexMiliseconds = date.indexOf('.');

    return date.slice(indexT + 1, indexMiliseconds);
  }
  return (
    <ul>
      {messages.map(message => (
        <li key={message.id}>
          {`${normilizeTime(message.time)}: `}
          {message.author}<br />
          {message.text}
        </li>
      ))}
    </ul >
  );
}