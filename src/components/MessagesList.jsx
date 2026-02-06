export const MessagesList = ({ list }) => {
  return (
    <div>
      {list.map((m, index) => (
        <p key={index}>
          <b>{m.author}</b>: {m.text}
          <small> ({new Date(m.time).toLocaleTimeString()})</small>
        </p>
      ))}
    </div>
  );
};
