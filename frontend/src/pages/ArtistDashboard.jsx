import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit, Disc, Music, Layers, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import './ArtistDashboard.css';

const ArtistDashboard = () => {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('songs');

    const [songTitle, setSongTitle] = useState('');
    const [songFile, setSongFile] = useState(null);
    const [uploadingSong, setUploadingSong] = useState(false);

    const [albumTitle, setAlbumTitle] = useState('');
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [creatingAlbum, setCreatingAlbum] = useState(false);

    const [mySongs, setMySongs] = useState([]);
    const [myAlbums, setMyAlbums] = useState([]);
    const [songsPage, setSongsPage] = useState(1);
    const [songsPagination, setSongsPagination] = useState({});

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchMySongs = async (page = 1) => {
        if (!user) return;
        try {
            const res = await axios.get(`/api/users/artist/${user.id}/songs?page=${page}&limit=10`);
            if (res.data.success) {
                setMySongs(res.data.musics);
                setSongsPagination(res.data.pagination);
                setSongsPage(res.data.pagination.page);
            }
        } catch (err) {
            console.error('Error fetching artist songs:', err);
        }
    };

    const fetchMyAlbums = async () => {
        try {
            const res = await axios.get('/api/music/albums');
            if (res.data.success) {
                const filtered = res.data.albums.filter(alb => {
                    const artistId = alb.artist?._id || alb.artist;
                    return artistId === user.id;
                });
                setMyAlbums(filtered);
            }
        } catch (err) {
            console.error('Error fetching artist albums:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMySongs(1);
            fetchMyAlbums();
        }
    }, [user]);

    const handleSongUpload = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setUploadingSong(true);

        if (!songTitle || !songFile) {
            setError('Please fill in title and select an audio file');
            setUploadingSong(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', songTitle);
        formData.append('music', songFile);

        try {
            const res = await axios.post('/api/music/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (res.data.success) {
                setSuccess('Song uploaded successfully!');
                setSongTitle('');
                setSongFile(null);
                document.getElementById('audio-file-input').value = '';
                fetchMySongs(1);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading song');
        } finally {
            setUploadingSong(false);
        }
    };

    const handleSongDelete = async (songId) => {
        if (!window.confirm('Are you sure you want to delete this song?')) return;
        setError('');
        setSuccess('');

        try {
            const res = await axios.delete(`/api/music/${songId}`);
            if (res.data.success) {
                setSuccess('Song deleted successfully!');
                fetchMySongs(songsPage);
                fetchMyAlbums();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting song');
        }
    };

    const handleSongUpdate = async (songId, currentTitle) => {
        const newTitle = window.prompt('Enter new song title:', currentTitle);
        if (!newTitle || newTitle === currentTitle) return;
        setError('');
        setSuccess('');

        try {
            const res = await axios.patch(`/api/music/${songId}`, { title: newTitle });
            if (res.data.success) {
                setSuccess('Song updated successfully!');
                fetchMySongs(songsPage);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating song');
        }
    };

    const handleCreateAlbum = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setCreatingAlbum(true);

        if (!albumTitle) {
            setError('Please enter an album title');
            setCreatingAlbum(false);
            return;
        }

        try {
            const res = await axios.post('/api/music/album', {
                title: albumTitle,
                musics: selectedSongs
            });
            if (res.data.success) {
                setSuccess('Album created successfully!');
                setAlbumTitle('');
                setSelectedSongs([]);
                fetchMyAlbums();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating album');
        } finally {
            setCreatingAlbum(false);
        }
    };

    const handleAlbumDelete = async (albumId) => {
        if (!window.confirm('Are you sure you want to delete this album?')) return;
        setError('');
        setSuccess('');

        try {
            const res = await axios.delete(`/api/music/albums/${albumId}`);
            if (res.data.success) {
                setSuccess('Album deleted successfully!');
                fetchMyAlbums();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting album');
        }
    };

    const toggleSelectSong = (songId) => {
        if (selectedSongs.includes(songId)) {
            setSelectedSongs(selectedSongs.filter(id => id !== songId));
        } else {
            setSelectedSongs([...selectedSongs, songId]);
        }
    };

    return (
        <div className="page-container">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Artist Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Upload tracks, manage songs, and bundle albums</p>

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

            <div className="dashboard-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'songs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('songs')}
                >
                    <Music size={18} /> Manage Songs
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'albums' ? 'active' : ''}`}
                    onClick={() => setActiveTab('albums')}
                >
                    <Layers size={18} /> Manage Albums
                </button>
            </div>

            {activeTab === 'songs' && (
                <div className="dashboard-grid">
                    <div className="glass-panel form-panel">
                        <h3>Publish New Song</h3>
                        <form onSubmit={handleSongUpload} className="auth-form" style={{ marginTop: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Song Title</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Enter song title"
                                    value={songTitle}
                                    onChange={(e) => setSongTitle(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Audio File</label>
                                <div className="file-upload-box">
                                    <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                                    <input 
                                        type="file" 
                                        id="audio-file-input"
                                        accept="audio/*" 
                                        onChange={(e) => setSongFile(e.target.files[0])}
                                    />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                                        {songFile ? songFile.name : 'Select audio file (MP3, WAV, etc.)'}
                                    </span>
                                </div>
                            </div>

                            <button type="submit" disabled={uploadingSong || !user?.isVerified} className="btn btn-primary" style={{ width: '100%' }}>
                                {uploadingSong ? 'Uploading File...' : 'Publish Song'}
                            </button>
                            {!user?.isVerified && (
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444', textAlign: 'center', marginTop: '8px' }}>
                                    Verification required to upload songs. Check console logs for activation links.
                                </span>
                            )}
                        </form>
                    </div>

                    <div className="glass-panel list-panel">
                        <h3>My Songs</h3>
                        <div className="item-list" style={{ marginTop: '16px' }}>
                            {mySongs.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                                    No songs uploaded yet.
                                </div>
                            ) : (
                                mySongs.map(song => (
                                    <div key={song._id} className="item-row">
                                        <div className="item-info">
                                            <Disc className="item-icon animate-spin-slow" />
                                            <span className="item-name">{song.title}</span>
                                        </div>
                                        <div className="item-actions">
                                            <button onClick={() => handleSongUpdate(song._id, song.title)} className="action-btn" title="Edit Title">
                                                <Edit size={15} />
                                            </button>
                                            <button onClick={() => handleSongDelete(song._id)} className="action-btn delete" title="Delete Song">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {songsPagination.totalPages > 1 && (
                            <div className="pagination-controls" style={{ marginTop: '20px' }}>
                                <button 
                                    className="pagination-btn" 
                                    disabled={songsPage <= 1}
                                    onClick={() => fetchMySongs(songsPage - 1)}
                                >
                                    Prev
                                </button>
                                <span className="pagination-info">Page {songsPage} of {songsPagination.totalPages}</span>
                                <button 
                                    className="pagination-btn"
                                    disabled={songsPage >= songsPagination.totalPages}
                                    onClick={() => fetchMySongs(songsPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'albums' && (
                <div className="dashboard-grid">
                    <div className="glass-panel form-panel">
                        <h3>Create New Album</h3>
                        <form onSubmit={handleCreateAlbum} className="auth-form" style={{ marginTop: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Album Title</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Enter album title"
                                    value={albumTitle}
                                    onChange={(e) => setAlbumTitle(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Select Songs to Include</label>
                                <div className="song-checkbox-list">
                                    {mySongs.length === 0 ? (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Publish songs first to bundle them into an album.
                                        </span>
                                    ) : (
                                        mySongs.map(song => (
                                            <div 
                                                key={song._id} 
                                                className={`song-select-row ${selectedSongs.includes(song._id) ? 'selected' : ''}`}
                                                onClick={() => toggleSelectSong(song._id)}
                                            >
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedSongs.includes(song._id)}
                                                    readOnly
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <span>{song.title}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={creatingAlbum || !user?.isVerified || mySongs.length === 0} className="btn btn-primary" style={{ width: '100%' }}>
                                {creatingAlbum ? 'Creating Album...' : 'Create Album'}
                            </button>
                        </form>
                    </div>

                    <div className="glass-panel list-panel">
                        <h3>My Albums</h3>
                        <div className="item-list" style={{ marginTop: '16px' }}>
                            {myAlbums.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                                    No albums created yet.
                                </div>
                            ) : (
                                myAlbums.map(album => (
                                    <div key={album._id} className="item-row">
                                        <div className="item-info">
                                            <Layers className="item-icon" />
                                            <span className="item-name">{album.title}</span>
                                        </div>
                                        <div className="item-actions">
                                            <button onClick={() => handleAlbumDelete(album._id)} className="action-btn delete" title="Delete Album">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistDashboard;
