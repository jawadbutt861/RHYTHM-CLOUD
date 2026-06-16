import React, {useState} from 'react'
import axios from '../api/client'

export default function CreateAlbum(){
  const [title,setTitle] = useState('')
  const [songs,setSongs] = useState('')
  const submit = async (e)=>{
    e.preventDefault()
    try{
      await axios.post('/api/music/album',{title,songs:songs.split(',')})
      alert('Album created')
    }catch(err){
      alert(err.response?.data?.message||'Error')
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Create Album</h2>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="title" />
      <input value={songs} onChange={e=>setSongs(e.target.value)} placeholder="comma separated song ids" />
      <button>Create</button>
    </form>
  )
}
