import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, User, ShieldCheck, AlertCircle, Disc } from 'lucide-react';
import './Auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        if (!username || !email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        const res = await register(username, email, password, role);
        if (res.success) {
            setSuccessMessage(res.message);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <Disc className="auth-logo" />
                    <h1>Create Account</h1>
                    <p>Start your listening or publishing journey</p>
                </div>

                {error && (
                    <div className="auth-error-alert">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="auth-success-alert">
                        <ShieldCheck size={16} />
                        <span>{successMessage} Redirecting...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div className="input-with-icon">
                            <User className="input-icon" size={18} />
                            <input 
                                type="text"
                                className="form-input"
                                placeholder="choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-with-icon">
                            <Mail className="input-icon" size={18} />
                            <input 
                                type="email"
                                className="form-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-with-icon">
                            <KeyRound className="input-icon" size={18} />
                            <input 
                                type="password"
                                className="form-input"
                                placeholder="min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Account Role</label>
                        <div className="role-selection-grid">
                            <button
                                type="button"
                                className={`role-option-btn ${role === 'user' ? 'active' : ''}`}
                                onClick={() => setRole('user')}
                            >
                                <span className="role-title">Listener</span>
                                <span className="role-desc">Search and stream music</span>
                            </button>
                            <button
                                type="button"
                                className={`role-option-btn ${role === 'artist' ? 'active' : ''}`}
                                onClick={() => setRole('artist')}
                            >
                                <span className="role-title">Artist</span>
                                <span className="role-desc">Publish songs and albums</span>
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary auth-submit-btn">
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
