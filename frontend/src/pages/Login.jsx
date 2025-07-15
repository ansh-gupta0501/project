import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import './Login.css';

export default function Login() {
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [error, setError] = useState('')
 const navigate = useNavigate()
 const { login } = useAuth()
 const handleLogin = async (e) => {
   e.preventDefault()
   try {
     const res = await api.post('/auth/login', { email, password })
     await login();
     navigate('/')
   } catch (err) {
     setError(err.response?.data?.message || 'Login failed')
   }
 }
 return (
<div className="login-container">
  <form onSubmit={handleLogin} className="login-form">
    <h2>Login</h2>
    {error && <p className="error-message">{error}</p>}
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button type="submit">Login</button>
  </form>
</div>
 )
}