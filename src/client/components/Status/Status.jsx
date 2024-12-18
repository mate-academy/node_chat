import { useEffect, useState } from 'react';
import styles from './status.module.css';

export const Status = ({ text }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer;

    if (text) {
      setIsActive(true);

      timer = setInterval(() => setIsActive(false), 5000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [text]);

  return isActive && <p className={styles.status}>{text}</p>;
};
