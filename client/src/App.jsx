import React from 'react'
import Header from './components/Header/Header'
import { Outlet } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import { SocketProvider } from './context/SocketProvider'

function App() {

  return (
    <SocketProvider>
      <Header />
      <Outlet />
      <Footer />
    </SocketProvider>
  )
}

export default App
