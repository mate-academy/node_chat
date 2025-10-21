'use client';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { useState } from 'react';

export default function Login({ setUsername }) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const handleJoinChat = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setUsername(trimmed); 
    navigate('/rooms');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleJoinChat();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome to Chat</h2>
          <p className="login-description">
            Enter your name to join the conversation
          </p>
        </div>
        <div className="login-content">
          <input
            className="login-input"
            type="text"
            placeholder="Your name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyUp={handleKeyPress}
            autoFocus
          />
          <button
            className="login-button"
            onClick={handleJoinChat}
            disabled={!inputValue.trim()}
          >
            Join Chat
          </button>
        </div>
      </div>
    </div>
  );
}
