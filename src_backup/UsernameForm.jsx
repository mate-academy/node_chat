import { useState } from "react"

const handleSubmit = async (event, username, onUsername) => {
  event.preventDefault();

  const preparedUsername = username.trim();

  if (!preparedUsername) {
    return;
  }

  const response = await fetch('http://localhost:3005/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: preparedUsername,
    }),
  });

  const user = await response.json();

  localStorage.setItem('chat_username', user.username);
  onUsername(user.username);
}

export function UsernameForm({onUsername}) {
  const [user, setUser] = useState('');
  
  return <>
    <form
    className="field is-horizontal"
      onSubmit={async (event) => {
        await handleSubmit(event, user, onUsername);
        setUser('');
      }}
    >
      <input
        type="text"
        className="input"
        placeholder="Enter a username"
        value={user}
        autoFocus
        onChange={event => setUser(event.target.value)}
      />
    </form>
  </>
}