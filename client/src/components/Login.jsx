import React from 'react'

function Login({ onLogin, tempName, onTempName }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <form onSubmit={onLogin} style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
        <h2>Who are you?</h2>
        <input
          type="text"
          placeholder="Enter username..."
          value={tempName}
          onChange={(e) => onTempName(e.target.value)}
          style={{ padding: '10px', marginBottom: '10px', display: 'block', width: '200px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Join Chat</button>
      </form>
    </div>
  )
}

export default Login;
