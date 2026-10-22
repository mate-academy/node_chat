export function AppHeader({ connectionStatus }) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">REALTIME MESSAGING</p>
        <h1>Chat room</h1>
      </div>
      <div className={`connection connection--${connectionStatus}`}>
        <span className="connection-dot" />
        {connectionStatus}
      </div>
    </header>
  );
}
