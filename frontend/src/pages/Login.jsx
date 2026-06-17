import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertCircle, Disc } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [emailOrUser, setEmailOrUser] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!emailOrUser || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        const res = await login(emailOrUser, password);
        if (res.success) {
            navigate('/');
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
                    <h1>Welcome Back</h1>
                    <p>Log in to access your custom music space</p>
                </div>

                {error && (
                    <div className="auth-error-alert">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Username or Email</label>
                        <div className="input-with-icon">
                            <Mail className="input-icon" size={18} />
                            <input 
                                type="text"
                                className="form-input"
                                placeholder="enter username or email"
                                value={emailOrUser}
                                onChange={(e) => setEmailOrUser(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label className="form-label">Password</label>
                            <Link to="/forgot-password" style={{ color: 'var(--color-primary)', fontSize: '0.8rem', textDecoration: 'none' }}>
                                Forgot?
                            </Link>
                        </div>
                        <div className="input-with-icon">
                            <KeyRound className="input-icon" size={18} />
                            <input 
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary auth-submit-btn">
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>New to Rhythm Cloud? <Link to="/register">Create Account</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
