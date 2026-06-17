import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loader } from 'lucide-react';

// Import components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Player from './components/Player';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import ArtistDashboard from './pages/ArtistDashboard';

// Route wrappers
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const ArtistRoute = ({ children }) => {
    const { user } = useAuth();
    return user?.role === 'artist' ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// Authenticated layout shell containing sidebar, player bar, navbar
const AuthenticatedLayout = () => {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/artist-dashboard" element={
                        <ArtistRoute>
                            <ArtistDashboard />
                        </ArtistRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
            <Player />
        </div>
    );
};

const App = () => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                height: '100vh', 
                width: '100vw', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: '#090d16',
                color: 'var(--color-primary)'
            }}>
                <Loader className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <Routes>
            {/* Public guest-only pages */}
            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <Register />
                </PublicRoute>
            } />
            
            {/* Public/Reset links (accessible anytime) */}
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Authenticated workspace wrapper */}
            <Route path="/*" element={
                <PrivateRoute>
                    <AuthenticatedLayout />
                </PrivateRoute>
            } />
        </Routes>
    );
};

export default App;
