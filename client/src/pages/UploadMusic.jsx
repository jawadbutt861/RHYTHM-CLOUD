import React, {useState} from 'react'
import axios from '../api/client'

export default function UploadMusic(){
  const [title,setTitle] = useState('')
  const [song,setSong] = useState(null)
  const [thumbnail,setThumbnail] = useState(null)
  const submit = async (e)=>{
    e.preventDefault()
    const fd = new FormData()
    fd.append('title',title)
    fd.append('song',song)
    fd.append('thumbnail',thumbnail)
    try{
      await axios.post('/api/music/create',fd,{headers:{'Content-Type':'multipart/form-data'}})
      alert('Uploaded')
    }catch(err){
      alert(err.response?.data?.message||'Error')
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Upload Music</h2>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="title" />
      <input type="file" onChange={e=>setSong(e.target.files[0])} />
      <input type="file" onChange={e=>setThumbnail(e.target.files[0])} />
      <button>Upload</button>
    </form>
  )
}
