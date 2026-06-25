import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, getMe } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data: tokens } = await login(form)
      localStorage.setItem('access_token', tokens.access)
      const { data: user } = await getMe()
      loginUser(tokens, user)
      navigate('/')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-surface-900 mb-1">Welcome back</h1>
        <p className="text-surface-500 text-sm mb-6">Sign in to your Nexus account</p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-surface-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" required />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-surface-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" required />
          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-surface-500 text-center mt-6">
          No account? <Link to="/register" className="text-primary-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  )
}
