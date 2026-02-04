import styles from './Room.module.scss';

export const Room = ({ roomName, isSelected, onSelect, onDelete, onEdit }) => {
  return (
    <div
      className={`${styles.room} ${isSelected ? styles.room__selected : ''}`}
      onClick={onSelect}
    >
      <p className={styles.room__name}>{roomName}</p>
      <button className={styles.room__button} onClick={onDelete}>
        <img
          className={styles.room__icon}
          src="/delete.svg"
          alt="Delete room"
        />
      </button>
      <button className={styles.room__button} onClick={onEdit}>
        <img className={styles.room__icon} src="/edit.svg" alt="Edit room" />
      </button>
    </div>
  );
};
