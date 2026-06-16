import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './pages/App'
import Login from './pages/Login'
import Register from './pages/Register'
import MusicList from './pages/MusicList'
import MusicDetail from './pages/MusicDetail'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import './styles.css'
import Albums from './pages/Albums'
import AlbumDetail from './pages/AlbumDetail'
import UploadMusic from './pages/UploadMusic'
import CreateAlbum from './pages/CreateAlbum'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<MusicList />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="music/:id" element={<MusicDetail />} />
            <Route path="albums" element={<Albums />} />
            <Route path="albums/:id" element={<AlbumDetail />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="upload" element={<UploadMusic />} />
            <Route path="create-album" element={<CreateAlbum />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
