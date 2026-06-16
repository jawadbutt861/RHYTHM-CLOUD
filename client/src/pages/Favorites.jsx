import React, {useEffect,useState} from 'react'
import axios from '../api/client'
import {Link} from 'react-router-dom'

export default function Favorites(){
  const [favorites,setFavorites] = useState([])
  useEffect(()=>{
    const load = async ()=>{
      const res = await axios.get('/api/user/favorites')
      setFavorites(res.data.favorites)
    }
    load()
  },[])

  return (
    <div>
      <h2>Favorites</h2>
      <ul>
        {favorites.map(f=> <li key={f._id}><Link to={`/music/${f._id}`}>{f.title}</Link></li>)}
      </ul>
    </div>
  )
}
