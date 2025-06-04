import React from 'react';
import styles from '../Chat.module.scss';
import classNames from 'classnames';

interface Props {
  user: string;
  date: string;
  text: string;
  isPeronal?: boolean;
}

export const Message: React.FC<Props> = ({
  user,
  date,
  text,
  isPeronal = false,
}) => {
  return (
    <div
      className={classNames(styles.message, {
        [styles['message--personal']]: isPeronal,
      })}
    >
      {!isPeronal && (
        <img
          src="/images/user2.png"
          alt="user"
          className={styles.message__user}
        />
      )}
      <strong className={styles.message__userName}>{user}</strong>
      <p className={styles.message__content}>{text}</p>
      <p className={styles.message__date}>{date}</p>
    </div>
  );
};
