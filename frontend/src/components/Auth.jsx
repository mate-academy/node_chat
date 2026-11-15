import { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const API_URL = 'http://localhost:3001/auth';

export const Auth = ({ setUserName }) => {
  const [authorName, setAuthorName] = useState('');
  const [error, setError] = useState('');

  return (
    <>
      <h2 className="auth__title">Enter Your Nickname</h2>
      <form
        className="form-row"
        onSubmit={async (event) => {
          event.preventDefault();
          const userName = authorName.trim();

          if (!userName) {
            setError('Username is required');
            return;
          }

          try {
            setError('');
            const response = await axios.post(API_URL, { userName });
            localStorage.setItem('userName', response.data);
            setUserName(response.data);
            setAuthorName('');
          } catch (requestError) {
            console.error(requestError);
            const responseError = requestError.response?.data;

            setError(
              typeof responseError === 'string'
                ? responseError
                : responseError?.text || 'Unable to sign in',
            );
          }
        }}
      >
        <input
          type="text"
          className="text-input"
          placeholder="Example: Dude"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
        />
        <button className="app-button app-button--primary">Send</button>
      </form>
      {error && <p className="auth__error">{error}</p>}
    </>
  );
};
