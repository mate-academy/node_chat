import React from "react";

const MessageItem = ({ message, currentUserId }) => {
  const isMine =
    message.userId === currentUserId;

  const time = new Date(
    message.createdAt,
  ).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`box ${
        isMine
          ? 'has-background-link-light'
          : ''
      }`}
    >
      <div className="is-flex is-justify-content-space-between">
        <strong>
          {message.author}
        </strong>

        <small className="has-text-grey">
          {time}
        </small>
      </div>

      <p className="mt-2">
        {message.text}
      </p>
    </div>
  );
};

export default MessageItem;
