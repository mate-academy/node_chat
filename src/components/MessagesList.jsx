
export const MessagesList = ({ list }) => {
  return (
    <div>
      {list.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
};
