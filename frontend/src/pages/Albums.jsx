import React, {useEffect,useState} from 'react'
import axios from '../api/client'
import {Link} from 'react-router-dom'

export default function Albums(){
  const [albums,setAlbums] = useState([])
  useEffect(()=>{
    const load = async ()=>{
      const res = await axios.get('/api/music/albums')
      setAlbums(res.data.albums)
    }
    load()
  },[])

  return (
    <div>
      <h2>Albums</h2>
      <ul>
        {albums.map(a=> <li key={a._id}><Link to={`/albums/${a._id}`}>{a.title} - {a.artist?.username}</Link></li>)}
      </ul>
    </div>
  )
}
