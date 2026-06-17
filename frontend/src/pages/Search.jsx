import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePlayer } from '../context/PlayerContext';
import { Search as SearchIcon, Play, Disc, Loader } from 'lucide-react';

const Search = () => {
    const { currentSong, playSong } = usePlayer();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const performSearch = async (searchQuery, searchPage = 1) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setPagination({});
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(`/api/music/search?q=${encodeURIComponent(searchQuery)}&page=${searchPage}&limit=12`);
            if (res.data.success) {
                setResults(res.data.musics);
                setPagination(res.data.pagination);
                setPage(res.data.pagination.page);
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Trigger search when query changes, with a small debounce or on button click. Let's trigger on search query change.
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query, 1);
        }, 400); // Wait 400ms after user stops typing to request

        // If query is typed, let's allow active key triggers or run instantly on button clicks.
        // Let's run it using useEffect debounced.
        return () => clearTimeout(timer);
    }, [query]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        performSearch(query, 1);
    };

    const handlePageChange = (nextPage) => {
        performSearch(query, nextPage);
    };

    return (
        <div className="page-container">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Search Library</h2>

            <form onSubmit={handleFormSubmit} style={{ marginBottom: '32px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <SearchIcon style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} size={20} />
                    <input 
                        type="text"
                        className="form-input"
                        placeholder="Search for tracks or artist names..."
                        style={{ paddingLeft: '48px', height: '52px', fontSize: '1.05rem', borderRadius: '12px' }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </form>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Loader className="animate-spin" style={{ color: 'var(--color-primary)' }} size={28} />
                </div>
            ) : results.length === 0 ? (
                <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {query.trim() ? 'No matching songs or artists found.' : 'Enter a search term above to explore Rhythm Cloud.'}
                </div>
            ) : (
                <>
                    <div className="catalog-grid">
                        {results.map((song) => {
                            const isCurrent = currentSong && currentSong._id === song._id;
                            return (
                                <div 
                                    key={song._id} 
                                    className="music-card"
                                    onClick={() => playSong(song, results)}
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
                                onClick={() => handlePageChange(page - 1)}
                            >
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {page} of {pagination.totalPages}
                            </span>
                            <button 
                                className="pagination-btn"
                                disabled={page >= pagination.totalPages}
                                onClick={() => handlePageChange(page + 1)}
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

export default Search;
