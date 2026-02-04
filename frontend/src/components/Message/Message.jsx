import styles from './Message.module.scss';

export const Message = ({ text, sender }) => {
  return (
    <div className={styles.message}>
      <strong>{sender}:</strong> {text}
    </div>
  );
};
