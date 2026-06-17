import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, AlertCircle, ShieldCheck, Disc } from 'lucide-react';
import './Auth.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (!password || !confirmPassword) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`/api/auth/reset-password/${token}`, { password });
            if (res.data.success) {
                setMessage(res.data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <Disc className="auth-logo" />
                    <h1>New Password</h1>
                    <p>Enter your new password below</p>
                </div>

                {error && (
                    <div className="auth-error-alert">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="auth-success-alert">
                        <ShieldCheck size={16} />
                        <span>{message} Redirecting to Login...</span>
                    </div>
                )}

                {!message && (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">New Password</label>
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
                            <label className="form-label">Confirm New Password</label>
                            <div className="input-with-icon">
                                <KeyRound className="input-icon" size={18} />
                                <input 
                                    type="password"
                                    className="form-input"
                                    placeholder="confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary auth-submit-btn">
                            {loading ? 'Updating Password...' : 'Save Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
