import React, {useEffect,useState} from 'react'
import axios from '../api/client'
import {Link} from 'react-router-dom'

export default function MusicList(){
  const [musics,setMusics] = useState([])
  const [page,setPage] = useState(1)
  const [search,setSearch] = useState('')

  const load = async ()=>{
    const res = await axios.get(`/api/music?search=${encodeURIComponent(search)}&page=${page}&limit=10`,{withCredentials:true})
    setMusics(res.data.musics)
  }

  useEffect(()=>{load()},[page,search])

  return (
    <div>
      <h2>Music</h2>
      <input placeholder="search" value={search} onChange={e=>setSearch(e.target.value)} />
      <ul>
        {musics.map(m=> (
          <li key={m._id}><Link to={`/music/${m._id}`}>{m.title} - {m.artist?.username}</Link></li>
        ))}
      </ul>
      <button onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
      <span>{page}</span>
      <button onClick={()=>setPage(p=>p+1)}>Next</button>
    </div>
  )
}
