import React, {useEffect,useState} from 'react'
import axios from '../api/client'

export default function Profile(){
  const [user,setUser] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      const res = await axios.get('/api/user/me',{withCredentials:true})
      setUser(res.data.user)
    }
    load()
  },[])

  if(!user) return <div>Loading...</div>
  return (
    <div>
      <h2>{user.username}</h2>
      <p>{user.email}</p>
    </div>
  )
}
