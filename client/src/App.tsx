import { NavLink, Outlet } from 'react-router-dom';
import './App.css';
import { useWebSocket } from './WebSocketContext.tsx';

function App() {
  const { userName } = useWebSocket();

  return (
    <>
      <nav
        className="navbar container"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <NavLink to="/" className="navbar-item is-size-5 has-text-link ">
            {userName}@Chat_App
          </NavLink>
          <div className="navbar-end">
            <div className="navbar-menu">
              <NavLink to="/" className="navbar-item">
                Chats
              </NavLink>

              <NavLink to="/rooms" className="navbar-item">
                Rooms
              </NavLink>

              <NavLink to="/logout" className="navbar-item">
                Logout
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      <main className="container">
        <article className="section">
          <Outlet />
        </article>
      </main>
    </>
  );
}

export default App;
