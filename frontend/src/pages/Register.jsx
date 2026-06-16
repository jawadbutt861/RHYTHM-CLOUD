import React, {useState} from 'react'
import axios from '../api/client'
import {useNavigate} from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register(){
  const [email,setEmail] = useState('')
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')
  const nav = useNavigate()
  const { loadUser } = useAuth()

  const submit = async (e)=>{
    e.preventDefault()
    try{
      await axios.post('/api/auth/register',{email,username,password},{withCredentials:true})
      await loadUser()
      nav('/')
    }catch(err){
      setError(err.response?.data?.message || 'Unable to register. Please try again.')
    }
  }

  return (
    <section className="auth-panel">
      <form onSubmit={submit} className="auth-form">
        <h2>Create your account</h2>
        <p className="form-subtitle">Start sharing and discovering new sounds.</p>
        {error && <div className="form-error">{error}</div>}
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button className="primary-button">Register</button>
      </form>
    </section>
  )
}
