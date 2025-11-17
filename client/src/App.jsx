// #region imports
import './App.css';
import { Outlet } from 'react-router-dom';
// #endregion

export function App() {
	return (
		<main className="App">
			<Outlet />
		</main>
	);
}
