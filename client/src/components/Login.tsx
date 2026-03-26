import { useState } from "react"

interface LoginProps {
    onLogin: (username: string) => void
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");

  const handleCreatUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (username.trim().length < 3) {
      return alert("Username must be at least 3 characters long");
    }

    localStorage.setItem('username', username);
    onLogin(username);
  }

  return (
    <section id="center" className="mt">
      <form onSubmit={handleCreatUser}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          className="counter ml"
          type="submit"
        >
          Login
        </button>
      </form>
    </section>
  )
}