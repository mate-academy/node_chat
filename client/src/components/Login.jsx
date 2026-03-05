function Login({ onLogin, temporaryName, onTemporaryNameChange }) {
  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onLogin}>
        <h2>Welcome to Node Chat</h2>
        <p className="login-subtitle">Enter your name to get started</p>

        <input
          type="text"
          className="login-input"
          placeholder="Your username..."
          value={temporaryName}
          onChange={(changeEvent) =>
            onTemporaryNameChange(changeEvent.target.value)
          }
        />

        <button type="submit" className="btn-primary">
          Join Chat
        </button>
      </form>
    </div>
  );
}

export default Login;
