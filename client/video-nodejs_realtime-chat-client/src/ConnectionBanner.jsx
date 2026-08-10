export const ConnectionBanner = ({ isConnected }) => {
  if (isConnected) return null;

  return (
    <div className="connection-banner">
      ⚠️ Connection lost — trying to reconnect…
    </div>
  );
};