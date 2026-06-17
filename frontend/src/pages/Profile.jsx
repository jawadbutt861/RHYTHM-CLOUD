import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, ShieldAlert, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();

    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!username || !email) {
            setError('Fields cannot be blank');
            setLoading(false);
            return;
        }

        if (username === user.username && email === user.email) {
            setError('No changes made to update');
            setLoading(false);
            return;
        }

        const res = await updateProfile(username, email);
        if (res.success) {
            setSuccess(res.message);
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="page-container">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Profile Settings</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>Manage your account settings and profile details</p>

            <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px' }}>
                {error && (
                    <div className="auth-error-alert" style={{ marginBottom: '24px' }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="auth-success-alert" style={{ marginBottom: '24px' }}>
                        <CheckCircle size={16} />
                        <span>{success}</span>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '24px' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: 'var(--color-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(139,92,246,0.3)'
                    }}>
                        {user?.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '4px' }}>{user?.username}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`user-role-badge ${user?.role}`} style={{ display: 'inline-block' }}>
                                {user?.role}
                            </span>
                            {user?.isVerified ? (
                                <span className="verification-badge verified">
                                    <ShieldCheck size={12} /> Email Verified
                                </span>
                            ) : (
                                <span className="verification-badge unverified">
                                    <ShieldAlert size={12} /> Email Unverified
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div className="input-with-icon">
                            <User className="input-icon" size={18} />
                            <input 
                                type="text"
                                className="form-input"
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {email !== user?.email && (
                            <span style={{ fontSize: '0.75rem', color: '#eab308', display: 'block', marginTop: '6px' }}>
                                Changing your email requires verifying the new address.
                            </span>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '16px', alignSelf: 'flex-start' }}>
                        {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
