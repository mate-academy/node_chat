// #region imports
import './App.css'
import { Routes, Route } from 'react-router';
import { HomePage } from './pages/HomePage.tsx';
import { Rooms } from './pages/Rooms.tsx';
import { ChatRoom } from './pages/ChatRoom.tsx';

// #endregion


export function App() {



  return <>
    <section className='section content'>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path='/rooms' element={<Rooms />}>
          <Route path =':roomId' element={<ChatRoom/>}/>

        </Route>
      </Routes>
   </section>
</>

}
