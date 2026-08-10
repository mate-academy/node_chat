export const TypingIndicator = ({ users }) => {
  if (users.length === 0) return null;

  const text =
    users.length === 1
      ? `${users[0]} is typing…`
      : `${users.join(', ')} are typing…`;

  return <p className="typing-indicator">{text}</p>;
};