import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, Music } from 'lucide-react';
import './Player.css';

const Player = () => {
    const {
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        togglePlay,
        nextSong,
        prevSong,
        seek,
        setVolume,
        toggleLike,
        isSongLiked
    } = usePlayer();

    const formatTime = (secs) => {
        if (isNaN(secs)) return '0:00';
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (!currentSong) return null;

    const liked = isSongLiked(currentSong._id);

    return (
        <div className="player-deck glass-panel">
            <div className="player-track-info">
                <div className="track-cover-fallback">
                    <Music size={20} />
                </div>
                <div className="track-details">
                    <span className="track-title">{currentSong.title}</span>
                    <span className="track-artist">
                        {currentSong.artist?.username || 'Unknown Artist'}
                    </span>
                </div>
                <button 
                    onClick={() => toggleLike(currentSong._id)} 
                    className={`player-like-btn ${liked ? 'liked' : ''}`}
                    title={liked ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                </button>
            </div>

            <div className="player-center-controls">
                <div className="player-buttons">
                    <button onClick={prevSong} className="control-btn" title="Previous Song">
                        <SkipBack size={20} />
                    </button>
                    <button onClick={togglePlay} className="control-btn play-btn" title={isPlaying ? "Pause" : "Play"}>
                        {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                    </button>
                    <button onClick={nextSong} className="control-btn" title="Next Song">
                        <SkipForward size={20} />
                    </button>
                </div>
                
                <div className="player-timeline">
                    <span className="time-text">{formatTime(progress)}</span>
                    <input 
                        type="range" 
                        min={0} 
                        max={duration || 0} 
                        value={progress}
                        onChange={(e) => seek(parseFloat(e.target.value))}
                        className="timeline-slider"
                    />
                    <span className="time-text">{formatTime(duration)}</span>
                </div>
            </div>

            <div className="player-right-controls">
                <div className="player-volume-control">
                    <Volume2 size={18} className="volume-icon" />
                    <input 
                        type="range" 
                        min={0} 
                        max={1} 
                        step={0.05} 
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="volume-slider"
                    />
                </div>
            </div>
        </div>
    );
};

export default Player;
