export const MessagesList = ({ list }) => {
  return (
    <div>
      {list.map((m) => (
        <p key={m.id}>
          <b>{m.author}</b>: {m.text}
          <small> ({new Date(m.time).toLocaleTimeString()})</small>
        </p>
      ))}
    </div>
  );
};
