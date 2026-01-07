import styles from './Error.module.scss';
import { CircleAlert, X } from 'lucide-react';

export const Error = ({
  errorMessage,
  isErrorMessageOpen,
  closeErrorMessage,
}) => {
  return (
    <div
      className={`${styles.errorContainer} ${
        isErrorMessageOpen ? '' : styles.close
      }`}
    >
      <div className={styles.error}>
        <div
          className={`${styles.iconContainer} ${styles.circleAlertContainer}`}
        >
          <CircleAlert />
        </div>
        <div className={styles.content}>
          <h1 className={styles.title}>Attention</h1>
          <p className={styles.message}>{errorMessage}</p>
        </div>
        <div
          className={`${styles.iconContainer} ${styles.closeContainer}`}
          onClick={closeErrorMessage}
        >
          <X />
        </div>
      </div>
    </div>
  );
};
