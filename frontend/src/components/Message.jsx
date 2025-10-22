export const Message = ({ message }) => {
  const messageDate = new Date(message.date).toLocaleString();
  return (
    <div className="message">
      <p className="has-text-weight-bold">{message.author}</p>
      <p>{message.text}</p>
      <p className="is-size-7">{messageDate}</p>
    </div>
  );
};
