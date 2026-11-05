import { Routes, Route } from 'react-router-dom';
import './App.css';
import Mainpage from './mainpage';
import MainChat from './MainChat';

function App() {
  return (
    <>
      <header>
        <div className='this__header'>

        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Mainpage />} />
          <Route path="/MainChat" element={<MainChat />} />
        </Routes>
      </main>

    </>
  )
}

export default App
