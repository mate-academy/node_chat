import type { Message, User } from '../types';

export const MessageList = ({ messages }: { messages: Message[] }) => {
  const getAuthorName = (author: User) => {
    if (!author) {
      return 'Невідомий';
    }

    return author.name || 'Невідомий';
  };

  const formatTime = (timeData: string) => {
    const date = new Date(timeData);

    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        flexGrow: 1,
        overflowY: 'auto',
        border: '1px solid #ddd',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        minHeight: '300px',
      }}
    >
      {messages.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>
          Повідомлень ще немає.
        </p>
      )}

      {messages.map((msg) => (
        <div
          key={msg._id}
          style={{
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: '#f9f9f9',
            border: '1px solid #eee',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <strong style={{ color: '#007bff' }}>
              {getAuthorName(msg.authorId)}
            </strong>
            <span style={{ color: '#aaa', fontSize: '12px' }}>
              {formatTime(msg.time)}
            </span>
          </div>
          <span style={{ color: '#333' }}>{msg.text}</span>
        </div>
      ))}
    </div>
  );
};
