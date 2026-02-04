import styles from './Input.module.scss';

export const Input = ({ value, onChange, placeholder }) => {
  return (
    <input
      className={styles.input}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};
