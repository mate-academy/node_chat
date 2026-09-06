import './App.scss';
import { Outlet } from "react-router-dom";

export const App = () => (
    <div className="App">
      <main className="section">
      <div className="container">
        <Outlet />
      </div>
    </main>
    </div>
)
