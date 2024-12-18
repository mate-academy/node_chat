import { useForm } from 'react-hook-form';
import styles from './join-form.module.css';

export const JoinForm = ({ connect }) => {
  const { handleSubmit, register } = useForm();

  const onSubmit = (data) => {
    localStorage.setItem('username', data.username);
    connect(data);
  };

  const savedUsername = localStorage.getItem('username') || '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles['join-form']}>
      <div className={styles['join-form__field-wrapper']}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          placeholder="Enter your username"
          defaultValue={savedUsername}
          {...register('username', { required: true, minLength: 2 })}
          className={styles['join-form__field']}
        />
      </div>
      <div className={styles['join-form__field-wrapper']}>
        <label htmlFor="room">Room name:</label>
        <input
          type="text"
          id="room"
          placeholder="Enter room name"
          {...register('room', { required: true, minLength: 2 })}
          className={styles['join-form__field']}
        />
      </div>
      <div className={styles['join-form__field-wrapper']}>
        <p>Action</p>
        <ul className={styles['join-form__action-list']}>
          <li>
            <input
              type="radio"
              id="create"
              value="create"
              defaultChecked
              {...register('type', { required: true })}
              className={`visually-hidden ${styles['join-form__radio']}`}
            />
            <label
              htmlFor="create"
              className={styles['join-form__action-label']}
            >
              Create
            </label>
          </li>
          <li>
            <input
              type="radio"
              id="join"
              value="join"
              {...register('type', { required: true })}
              className={`visually-hidden ${styles['join-form__radio']}`}
            />
            <label htmlFor="join" className={styles['join-form__action-label']}>
              Join
            </label>
          </li>
        </ul>
      </div>
      <button type="submit" className="button">
        Connect
      </button>
    </form>
  );
};
