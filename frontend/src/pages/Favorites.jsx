import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePlayer } from '../context/PlayerContext';
import { Heart, Play, Disc, Loader } from 'lucide-react';

const Favorites = () => {
    const { currentSong, playSong } = usePlayer();
    
    const [likedSongs, setLikedSongs] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async (pageNum = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/users/favorites?page=${pageNum}&limit=8`);
            if (res.data.success) {
                setLikedSongs(res.data.musics);
                setPagination(res.data.pagination);
                setPage(res.data.pagination.page);
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites(1);
    }, []);

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-primary)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                    <Heart size={28} fill="currentColor" />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Liked Songs</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your personal collection of favorite tracks</p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Loader className="animate-spin" style={{ color: 'var(--color-primary)' }} size={28} />
                </div>
            ) : likedSongs.length === 0 ? (
                <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    You haven't liked any songs yet. Go to Home or Search to discover music!
                </div>
            ) : (
                <>
                    <div className="catalog-grid">
                        {likedSongs.map((song) => {
                            const isCurrent = currentSong && currentSong._id === song._id;
                            return (
                                <div 
                                    key={song._id} 
                                    className="music-card"
                                    onClick={() => playSong(song, likedSongs)}
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

                    {pagination.totalPages > 1 && (
                        <div className="pagination-controls">
                            <button 
                                className="pagination-btn"
                                disabled={page <= 1}
                                onClick={() => fetchFavorites(page - 1)}
                            >
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {page} of {pagination.totalPages}
                            </span>
                            <button 
                                className="pagination-btn"
                                disabled={page >= pagination.totalPages}
                                onClick={() => fetchFavorites(page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Favorites;
