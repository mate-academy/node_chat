import { useState, type FormEvent } from "react";

interface Props {
  setUsername: (name: string) => void;
}

export const UserNameForm = ({setUsername}: Props) => {
  const [usernameInput, setUsernameInput] = useState('');

  function handleUsernameSubmit(event: FormEvent) {
    event.preventDefault();

    const newUsername = usernameInput.trim();

    if (!newUsername) {
      return;
    }

    localStorage.setItem('username', newUsername);

    setUsername(newUsername);
  }

  return (
    <div className="columns is-centered">
      <div className="column is-5">
        <div className="box">
          <h2 className="subtitle has-text-centered">
            Welcome to the chat!
          </h2>

          <form onSubmit={handleUsernameSubmit}>
            <div className="field">
              <label className="label">Username</label>

              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="Enter your username"
                  value={usernameInput}
                  onChange={event =>
                    setUsernameInput(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="field">
              <div className="control">
                <button
                  className="button is-primary is-fullwidth"
                  type="submit"
                >
                  Continue
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
