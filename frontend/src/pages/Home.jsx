import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePlayer } from '../context/PlayerContext';
import { Disc, Play, RefreshCw, Layers } from 'lucide-react';

const Home = () => {
    const { currentSong, isPlaying, playSong } = usePlayer();

    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [songsPage, setSongsPage] = useState(1);
    const [songsPagination, setSongsPagination] = useState({});
    const [loadingSongs, setLoadingSongs] = useState(true);
    const [loadingAlbums, setLoadingAlbums] = useState(true);

    const fetchSongs = async (page = 1) => {
        setLoadingSongs(true);
        try {
            const res = await axios.get(`/api/music?page=${page}&limit=6`);
            if (res.data.success) {
                setSongs(res.data.musics);
                setSongsPagination(res.data.pagination);
                setSongsPage(res.data.pagination.page);
            }
        } catch (err) {
            console.error('Error fetching songs:', err);
        } finally {
            setLoadingSongs(false);
        }
    };

    const fetchAlbums = async () => {
        setLoadingAlbums(true);
        try {
            const res = await axios.get('/api/music/albums?page=1&limit=6');
            if (res.data.success) {
                setAlbums(res.data.albums);
            }
        } catch (err) {
            console.error('Error fetching albums:', err);
        } finally {
            setLoadingAlbums(false);
        }
    };

    useEffect(() => {
        fetchSongs(1);
        fetchAlbums();
    }, []);

    return (
        <div className="page-container">
            <section style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Featured Songs</h2>
                    <button 
                        onClick={() => fetchSongs(songsPage)} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {loadingSongs ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <RefreshCw className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                    </div>
                ) : songs.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No tracks have been published yet.
                    </div>
                ) : (
                    <>
                        <div className="catalog-grid">
                            {songs.map((song) => {
                                const isCurrent = currentSong && currentSong._id === song._id;
                                return (
                                    <div 
                                        key={song._id} 
                                        className="music-card"
                                        onClick={() => playSong(song, songs)}
                                    >
                                        <div className="music-card-cover">
                                            <Disc size={36} style={{ opacity: 0.3 }} />
                                            <button className="music-card-play-btn">
                                                <Play size={18} fill="white" />
                                            </button>
                                        </div>
                                        <div className="music-card-title" style={{ color: isCurrent ? 'var(--color-primary)' : 'inherit' }}>
                                            {song.title}
                                        </div>
                                        <div className="music-card-subtitle">
                                            {song.artist?.username || 'Unknown Artist'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {songsPagination.totalPages > 1 && (
                            <div className="pagination-controls">
                                <button 
                                    className="pagination-btn"
                                    disabled={songsPage <= 1}
                                    onClick={() => fetchSongs(songsPage - 1)}
                                >
                                    Previous
                                </button>
                                <span className="pagination-info">
                                    Page {songsPage} of {songsPagination.totalPages}
                                </span>
                                <button 
                                    className="pagination-btn"
                                    disabled={songsPage >= songsPagination.totalPages}
                                    onClick={() => fetchSongs(songsPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Albums</h2>
                
                {loadingAlbums ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <RefreshCw className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                    </div>
                ) : albums.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No albums created yet.
                    </div>
                ) : (
                    <div className="catalog-grid">
                        {albums.map((album) => (
                            <div 
                                key={album._id} 
                                className="music-card"
                            >
                                <div className="music-card-cover" style={{ background: 'linear-gradient(135deg, #311042 0%, #111827 100%)' }}>
                                    <Layers size={36} style={{ opacity: 0.3 }} />
                                </div>
                                <div className="music-card-title">
                                    {album.title}
                                </div>
                                <div className="music-card-subtitle">
                                    by {album.artist?.username || 'Unknown'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
