export const MessageList = ({ messages }) => (
  <ul className="mt-5">
    {messages.map(message => (
      <li key={message.time} className="box mb-4">
        <div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
          <h1 className="title is-5 mb-0">
            {message.author}
          </h1>

          <h2 className="tag is-light">
            {new Date(message.time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </h2>
        </div>

        <p className="content mb-0">
          {message.text}
        </p>
      </li>
    ))}
  </ul>
);
