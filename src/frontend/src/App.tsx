import './App.css';
import { HashRouter, Route, Routes } from 'react-router';
import { JoinPage } from './pages/JoinPage/JoinPage';
import { ProtectedChat } from './components/ProtectedChat/ProtectedChat';

function App() {

  return (
    <main className="main">
      <HashRouter>
        <Routes>
          <Route path="/" element={<JoinPage />} />
          <Route path="/chat" element={<ProtectedChat />} />
        </Routes>
      </HashRouter>
    </main>
  );
}

export default App;
