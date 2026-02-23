import React from 'react';

function Sidebar({ rooms, currentRoom, onSelectRoom, onCreateRoom, onLogout, username, onRenameRoom, onDeleteRoom }) {
  return (
    <aside style={{ width: '250px', backgroundColor: '#f4f4f4', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '15px', borderBottom: '1px solid #ddd' }}>
        <strong>User: {username}</strong>
        <button onClick={onLogout} style={{ marginLeft: '10px', fontSize: '10px' }}>Logout</button>
      </div>

      <div style={{ flex: 1, padding: '15px' }}>
        <h3>Rooms</h3>
        <button onClick={onCreateRoom} style={{ width: '100%', marginBottom: '10px' }}>+ Create Room</button>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {rooms.map(room => (
            <li key={room} style={{
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: currentRoom === room ? '#ddd' : 'transparent',
              borderRadius: '4px'
            }} onClick={() => onSelectRoom(room)}>
              # {room}

              {room !== 'General' && (
                <div style={{ float: 'right', fontSize: '12px' }}>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    onRenameRoom(room);
                  }}>✏️</button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRoom(room);
                  }}>❌</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar;
