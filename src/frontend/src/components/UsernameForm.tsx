import { MessageCircle } from 'lucide-react';
import { iconColor } from '../types/IconColor';
import { useContext, useState } from 'react';
import { UsernameContext } from '../context/UsernameContext';
import { useNavigate } from 'react-router';

export const UsernameForm: React.FC = () => {
  const [value, setValue] = useState('');
  const { setUsername, setUsernameId } = useContext(UsernameContext);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.SubmitEvent) => {
    setError('');
    event.preventDefault();

    const normalizedUsername = value.trim();

    if (!normalizedUsername) {
      setError('Username cannot be empty!');

      return;
    }

    const usernameId = Date.now();

    setUsername(normalizedUsername);
    setUsernameId(usernameId);

    navigate('/chat');
  };

  return (
    <section className="username-form-section flex-column-center">
      <MessageCircle size={50} color={iconColor} />
      <h2>Welcome to Chat</h2>
      <p className="username-text">Please enter your username to continue</p>
      <form
        className="flex-column-center username-form"
        onSubmit={handleSubmit}
      >
        <div className="input-wrapper">
          <label htmlFor="username">
            <strong>Username</strong>
          </label>
          <input
            type="text"
            name="username"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter your username"
            className="form-input"
          />
        </div>
        {error && <p className="notification-error">{error}</p>}
        <button type="submit" className="username-form-button form-button">
          Start chatting
        </button>
      </form>
    </section>
  );
};
