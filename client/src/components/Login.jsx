export function Login({ onLogin }) {
  function handleSubmit(event) {
    event.preventDefault();

    const username = new FormData(event.target).get('username').toString().trim();

    if (username) {
      onLogin(username);
    }
  }

  return (
    <section className="login-screen">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Node Chat</h1>
        <input
          name="username"
          type="text"
          placeholder="Enter your username"
          autoComplete="off"
          required
        />
        <button type="submit">Join chat</button>
      </form>
    </section>
  );
}
