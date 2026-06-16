import React, {useEffect,useState} from 'react'
import axios from '../api/client'
import {useParams, Link} from 'react-router-dom'

export default function AlbumDetail(){
  const {id} = useParams()
  const [album,setAlbum] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      const res = await axios.get(`/api/music/albums/${id}`)
      setAlbum(res.data.albumMusic)
    }
    load()
  },[id])

  if(!album) return <div>Loading...</div>
  return (
    <div>
      <h2>{album.title}</h2>
      <p>Artist: {album.artist?.username}</p>
      <ul>
        {album.songs.map(s=> <li key={s._id}><Link to={`/music/${s._id}`}>{s.title}</Link></li>)}
      </ul>
    </div>
  )
}
