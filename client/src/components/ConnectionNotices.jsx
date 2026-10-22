export function ConnectionNotices({
  error,
  connectionStatus,
  onDismissError,
  onReconnect,
}) {
  return (
    <>
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button type="button" onClick={onDismissError} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {connectionStatus !== 'connected' && (
        <div className="connection-banner">
          <span>
            {connectionStatus === 'connecting'
              ? 'Connecting to chat server…'
              : 'Connection to chat server is unavailable.'}
          </span>
          {connectionStatus === 'disconnected' && (
            <button className="text-button" type="button" onClick={onReconnect}>
              Reconnect
            </button>
          )}
        </div>
      )}
    </>
  );
}
