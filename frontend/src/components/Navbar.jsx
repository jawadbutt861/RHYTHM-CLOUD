import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="navbar-container glass-panel">
            <div className="navbar-left">
                {user && !user.isVerified && (
                    <div className="verification-warning-banner">
                        <AlertCircle size={16} className="warning-icon" />
                        <span>Email unverified. Check your backend console logs for the activation link!</span>
                    </div>
                )}
            </div>

            <div className="navbar-right">
                {user ? (
                    <div className="navbar-user-profile">
                        <div className="user-avatar">
                            {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user.username}</span>
                            <div className="user-badge-container">
                                <span className={`user-role-badge ${user.role}`}>
                                    {user.role}
                                </span>
                                {user.isVerified ? (
                                    <span className="verification-badge verified" title="Email Verified">
                                        <ShieldCheck size={13} />
                                        <span>Verified</span>
                                    </span>
                                ) : (
                                    <span className="verification-badge unverified" title="Email Unverified">
                                        <ShieldAlert size={13} />
                                        <span>Unverified</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <span className="navbar-guest-tag">Welcome, Guest</span>
                )}
            </div>
        </header>
    );
};

export default Navbar;
