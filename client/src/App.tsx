import { Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Login from './pages/Login'
import Chat from './pages/Chat'
import Rooms from './pages/Rooms'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<Login/>}/>
        <Route path='chat' element={<Chat/>}/>
        <Route path='rooms' element={<Rooms/>}/>
        <Route path='rooms/:id' element={<Chat/>}/>
      </Route>
    </Routes>
  )
}

export default App
