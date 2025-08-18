import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div className='header'>
      <div>Chat App</div>
      <Link to="rooms" className="menu__link">Rooms</Link>
      <Link to="." className="menu__link">Log in</Link>
    </div>
  )
}

export default Header
