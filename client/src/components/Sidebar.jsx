function Sidebar({
  rooms,
  currentRoom,
  onSelectRoom,
  onCreateRoom,
  onLogout,
  username,
  onRenameRoom,
  onDeleteRoom,
}) {
  const firstLetter = username.charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{firstLetter}</div>
          <span className="sidebar-username">{username}</span>
        </div>

        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="sidebar-rooms">
        <div className="sidebar-section-title">Rooms</div>

        <button className="btn-create-room" onClick={onCreateRoom}>
          + New Room
        </button>

        <ul className="room-list">
          {rooms.map((room) => {
            const isActive = currentRoom === room;
            const isGeneral = room === 'General';

            return (
              <li
                key={room}
                className={`room-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectRoom(room)}
              >
                <div className="room-name">
                  <span className="room-hash">#</span>
                  <span className="room-name-text">{room}</span>
                </div>

                {!isGeneral && (
                  <div className="room-actions">
                    <button
                      className="btn-room-action"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        onRenameRoom(room);
                      }}
                    >
                      ✎
                    </button>

                    <button
                      className="btn-room-action danger"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        onDeleteRoom(room);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
