import { useForm } from 'react-hook-form';
import styles from './message-form.module.css';

export const MessageForm = ({ send }) => {
  const { handleSubmit, register, reset } = useForm();

  const onSubmit = (data) => {
    send(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles['message-form']}>
      <div className={styles['message-form__field']}>
        <label htmlFor="message" className="visually-hidden">
          Message
        </label>
        <input
          type="text"
          id="message"
          {...register('message', { required: true })}
          className={styles['message-form__input']}
          placeholder="Message"
        />
      </div>
      <button type="submit" className="button">
        Send
      </button>
    </form>
  );
};
