import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Loader, Disc } from 'lucide-react';
import './Auth.css';

const VerifyEmail = () => {
    const { token } = useParams();
    const { verifyEmail } = useAuth();
    
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleVerification = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification token.');
                return;
            }
            const res = await verifyEmail(token);
            if (res.success) {
                setStatus('success');
                setMessage(res.message);
            } else {
                setStatus('error');
                setMessage(res.message);
            }
        };

        handleVerification();
    }, [token]);

    return (
        <div className="auth-page-container">
            <div className="auth-card glass-panel" style={{ textAlign: 'center' }}>
                <div className="auth-header">
                    <Disc className="auth-logo animate-spin" />
                    <h1>Email Verification</h1>
                </div>

                {status === 'verifying' && (
                    <div className="auth-status-container">
                        <Loader className="spinner-icon" size={36} />
                        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Verifying your email token. Please wait...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="auth-status-container">
                        <div className="status-avatar success">
                            <ShieldCheck size={48} />
                        </div>
                        <p className="status-text success" style={{ marginTop: '16px', fontWeight: '600' }}>{message}</p>
                        <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Your account is fully activated. You can now toggle favorites, list libraries, and upload tracks!
                        </p>
                        <Link to="/" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>
                            Go to Home
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="auth-status-container">
                        <div className="status-avatar error">
                            <ShieldAlert size={48} />
                        </div>
                        <p className="status-text error" style={{ marginTop: '16px', fontWeight: '600' }}>{message}</p>
                        <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            The verification link is invalid, expired, or has already been used.
                        </p>
                        <Link to="/" className="btn btn-secondary" style={{ marginTop: '24px', display: 'inline-flex' }}>
                            Go to Home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
