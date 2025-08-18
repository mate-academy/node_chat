import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'

const Layout = () => {
  return (
    <div className='wrapper'>
      <Header/>
      <Outlet/>
      <Footer/>
    </div>
  )
}

export default Layout
