import React, { useState } from 'react';

const AVATARS = [
  '/avatars/avatar1.jpg',
  '/avatars/avatar2.jpg',
  '/avatars/avatar3.jpg',
];

interface AuthScreenProps {
  onLogin: (username: string, avatar: string) => void;
  initialAvatar: string;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, initialAvatar }) => {
  const [username, setUsername] = useState<string>('');
  const [avatar, setAvatar] = useState<string>(initialAvatar);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return alert('Enter your name, hero!');
    onLogin(username.trim(), avatar);
  };

  return (
    <div className="screen box-retro">
      <h2>// LOGIN</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>YOUR NAME:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Type here..."
            maxLength={12}
          />
        </div>

        <div className="field">
          <label>CHOOSE AVATAR:</label>
          <div className="avatar-picker">
              {AVATARS.map(av => (
                <img
                  key={av}
                  src={av}
                  alt="Avatar Option"
                  className={`avatar-option ${avatar === av ? 'active' : ''}`}
                  onClick={() => setAvatar(av)}
                />
              ))}
            </div>
        </div>

        <button type="submit" className="btn-retro">START GAME</button>
      </form>
    </div>
  );
};

export default AuthScreen;
