import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, LayoutDashboard, User, LogOut, Disc } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();

    return (
        <aside className="sidebar-container glass-panel">
            <div className="sidebar-brand">
                <Disc className="brand-icon" />
                <span className="brand-name">Rhythm Cloud</span>
            </div>
            
            <nav className="sidebar-nav">
                <NavLink 
                    to="/" 
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                    <Home size={20} />
                    <span>Home</span>
                </NavLink>

                <NavLink 
                    to="/search" 
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                    <Search size={20} />
                    <span>Search</span>
                </NavLink>

                <NavLink 
                    to="/favorites" 
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                    <Heart size={20} />
                    <span>Liked Songs</span>
                </NavLink>

                {user?.role === 'artist' && (
                    <NavLink 
                        to="/artist-dashboard" 
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <LayoutDashboard size={20} />
                        <span>Artist Dashboard</span>
                    </NavLink>
                )}

                <NavLink 
                    to="/profile" 
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                    <User size={20} />
                    <span>Profile</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                {user && (
                    <button onClick={logout} className="sidebar-btn-logout">
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
