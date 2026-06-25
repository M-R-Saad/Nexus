import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, login, getMe } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      const { data: tokens } = await login({ email: form.email, password: form.password })
      localStorage.setItem('access_token', tokens.access)
      const { data: user } = await getMe()
      loginUser(tokens, user)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data
      setError(msg ? JSON.stringify(msg) : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-surface-900 mb-1">Create your account</h1>
        <p className="text-surface-500 text-sm mb-6">Join Nexus and start collaborating</p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-surface-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" required />
          <input type="text" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full border border-surface-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" required />
          <input type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-surface-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" required minLength={8} />
          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-surface-500 text-center mt-6">
          Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
