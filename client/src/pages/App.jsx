import React, { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function App(){
  const nav = useNavigate()
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    nav('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-wrapper">
          <Link to="/" className="brand-link" onClick={closeMenu}>Rhythm Cloud</Link>
          <p className="brand-tag">Stream, upload, and explore beats with style.</p>
        </div>

        <button className="mobile-menu-toggle" onClick={() => setMenuOpen(open => !open)} aria-label="Toggle navigation">
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/albums" onClick={closeMenu}>Albums</Link>
          <Link to="/favorites" onClick={closeMenu}>Favorites</Link>
          <Link to="/profile" onClick={closeMenu}>Profile</Link>
          {user && <Link to="/upload" onClick={closeMenu}>Upload</Link>}
          {user && <Link to="/create-album" onClick={closeMenu}>Create Album</Link>}
          {!loading && !user && <Link to="/login" onClick={closeMenu}>Login</Link>}
          {!loading && !user && <Link to="/register" onClick={closeMenu}>Register</Link>}
          {user && <button className="primary-button logout-button" onClick={handleLogout}>Logout</button>}
        </nav>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}
