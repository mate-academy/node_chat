import styles from './messages.module.css';

export const Messages = ({ messages, className }) => {
  if (!messages.length) {
    return <p className={className}>No massages</p>;
  }

  return (
    <ul className={`${styles['messages']} ${className}`}>
      {messages.map((message) => {
        const date = new Date(message.createdAt);
        const formattedDate = new Intl.DateTimeFormat('uk-UA', {
          timeStyle: 'medium',
        }).format(date);

        return (
          <li key={message.id} className={styles['messages__item']}>
            <p>{message.username}</p>
            <p>{message.text}</p>
            <p>{formattedDate}</p>
          </li>
        );
      })}
    </ul>
  );
};
