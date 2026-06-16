import React, {useEffect,useState} from 'react'
import axios from '../api/client'
import {useParams} from 'react-router-dom'

export default function MusicDetail(){
  const {id} = useParams()
  const [music,setMusic] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      const res = await axios.get(`/api/music/${id}`,{withCredentials:true})
      setMusic(res.data.music)
    }
    load()
  },[id])

  if(!music) return <div>Loading...</div>
  return (
    <div>
      <h2>{music.title}</h2>
      <p>Artist: {music.artist?.username}</p>
      <img src={music.thumbnail} alt="thumb" width={200} />
      <audio controls src={music.song}></audio>
    </div>
  )
}
