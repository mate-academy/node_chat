import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useEffect } from 'react';

const Home = ({ username, setUsername, room, setRoom, socket }) => {
  const navigate = useNavigate();

  const joinRoom = () => {
    const trimmedRoom = room.trim();
    const trimmedUsername = username.trim();

    if (trimmedRoom === '' || trimmedUsername === '') {
      alert('Please enter both room and username to join.');
    } else {
      localStorage.setItem('username', trimmedUsername);

      socket.emit('join_room', { username: trimmedUsername, room: trimmedRoom });
      navigate('/chat', { replace: true });
    }
  };


  useEffect(() => {
    const storedUsername = localStorage.getItem('username');

    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [setUsername]);


  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>{`First Chat`}</h1>
        <input
         className={styles.input}
         placeholder='Username...'
         onChange={(e) => setUsername(e.target.value)}
        />

        <select
          className={styles.input}
          onChange={(e) => setRoom(e.target.value)}
        >
          <option>-- Select Room --</option>
          <option value='room_1'>Room 1</option>
          <option value='room_2'>Room 2</option>
          <option value='room_3'>Room 3</option>
          <option value='room_4'>Room 4</option>
        </select>

        <button
          className='btn btn-secondary'
          style={{ width: '100%' }}
          onClick={joinRoom}
          >
            Join Room
          </button>
      </div>
    </div>
  );
};

export default Home;
