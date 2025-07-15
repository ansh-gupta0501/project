import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import './Register.css'
export default function Register() {
 const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
 const [error, setError] = useState('')
 const navigate = useNavigate()
 const { login } = useAuth()
 const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
 const handleRegister = async (e) => {
   e.preventDefault()
   try {
     const res = await api.post('/auth/register', form)
     console.log(res)
     await login()
     navigate('/')
   } catch (err) {
     const errors = err.response?.data?.errors || {}
     setError(Object.values(errors).flat().join(', ') || 'Registration failed')
   }
}

 return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="register-form">
        <h2>Register</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password_confirmation"
          placeholder="Confirm Password"
          value={form.password_confirmation}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  )
}