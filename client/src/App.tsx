import { useState } from 'react'
import './App.css'
import { Login } from './components/Login'
import { Rooms } from './components/Rooms'

function App() {
  const [username, setUsername] =
    useState(localStorage.getItem('username') || "");
  
  if (!username) {
    return <Login onLogin={setUsername} />
  }
  if (username) {
    return (
      <>
        <section id="center" className="mt">
          <div>
            <h1>Привіт, {username}! Незабаром тут буде чат</h1>
            <Rooms />
          </div>
        </section>
      </>
    )
  }
}

export default App
