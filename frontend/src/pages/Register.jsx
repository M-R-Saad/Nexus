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
      if (msg && typeof msg === 'object') {
        const first = Object.values(msg).flat()[0]
        setError(typeof first === 'string' ? first : 'Registration failed.')
      } else {
        setError('Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fadeInUp">
        <div className="card rounded-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-glow-sm">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Create your account</h1>
            <p className="text-surface-500 dark:text-surface-400 text-sm">Join Nexus and start collaborating</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-6 border border-red-100 dark:border-red-500/20">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Username</label>
              <input type="text" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input" placeholder="Choose a username" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
              <input type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input" placeholder="Min 8 characters" required minLength={8} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-200 dark:border-surface-700" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-surface-900 px-3 text-surface-400">or</span></div>
          </div>

          <p className="text-sm text-surface-500 dark:text-surface-400 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
