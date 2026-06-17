import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
    const { user, refreshSession } = useAuth();
    
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem('rhythmVolume')) || 0.8);
    const [queue, setQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(0);

    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = volume;

        const onTimeUpdate = () => setProgress(audio.currentTime);
        const onLoadedMetadata = () => setDuration(audio.duration || 0);
        const onEnded = () => handleNext();

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('ended', onEnded);
        };
    }, [queue, queueIndex, volume]);

    const playSong = (song, trackList = []) => {
        if (!song) return;
        
        const audio = audioRef.current;
        
        if (currentSong && currentSong._id === song._id) {
            togglePlay();
            return;
        }

        if (trackList.length > 0) {
            setQueue(trackList);
            const index = trackList.findIndex(s => s._id === song._id);
            setQueueIndex(index !== -1 ? index : 0);
        } else {
            setQueue([song]);
            setQueueIndex(0);
        }

        setCurrentSong(song);
        audio.src = song.uri;
        audio.load();
        
        audio.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error("Error playing audio:", err));
    };

    const togglePlay = () => {
        if (!currentSong) return;
        
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Error playing audio:", err));
        }
    };

    const handleNext = () => {
        if (queue.length === 0) return;
        const nextIndex = (queueIndex + 1) % queue.length;
        setQueueIndex(nextIndex);
        const nextSong = queue[nextIndex];
        
        setCurrentSong(nextSong);
        const audio = audioRef.current;
        audio.src = nextSong.uri;
        audio.load();
        audio.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error("Error playing next song:", err));
    };

    const handlePrev = () => {
        if (queue.length === 0) return;
        
        const audio = audioRef.current;
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        const prevIndex = (prevIndex => prevIndex < 0 ? queue.length - 1 : prevIndex)((queueIndex - 1));
        setQueueIndex(prevIndex);
        const prevSong = queue[prevIndex];
        
        setCurrentSong(prevSong);
        audio.src = prevSong.uri;
        audio.load();
        audio.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error("Error playing prev song:", err));
    };

    const seek = (seconds) => {
        if (!currentSong) return;
        audioRef.current.currentTime = seconds;
        setProgress(seconds);
    };

    const adjustVolume = (val) => {
        const vol = Math.max(0, Math.min(1, val));
        setVolume(vol);
        audioRef.current.volume = vol;
        localStorage.setItem('rhythmVolume', vol);
    };

    const toggleLike = async (songId) => {
        if (!user) return { success: false, message: 'Please log in' };
        try {
            const res = await axios.post(`/api/users/favorites/${songId}`);
            if (res.data.success) {
                await refreshSession();
                return { success: true, message: res.data.message };
            }
        } catch (err) {
            return { success: false, message: 'Could not update favorites' };
        }
    };

    const isSongLiked = (songId) => {
        const favIds = user?.favorites || [];
        return favIds.some(fav => {
            const id = fav._id || fav;
            return id === songId;
        });
    };

    return (
        <PlayerContext.Provider value={{
            currentSong,
            isPlaying,
            progress,
            duration,
            volume,
            queue,
            queueIndex,
            playSong,
            togglePlay,
            nextSong: handleNext,
            prevSong: handlePrev,
            seek,
            setVolume: adjustVolume,
            toggleLike,
            isSongLiked
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);
