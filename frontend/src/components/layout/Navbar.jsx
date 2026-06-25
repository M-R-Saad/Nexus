import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../api/auth'
import NotificationBell from '../ui/NotificationBell'
import Avatar from '../ui/Avatar'

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef()

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token')
    try { await logout(refresh) } catch {}
    logoutUser()
    navigate('/login')
  }

  return (
    <nav className="bg-surface-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-surface-800">
      <Link to="/" className="text-xl font-bold tracking-tight text-primary-400">
        Nexus
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/discover" className="text-sm text-surface-300 hover:text-white transition-colors">
          Discover
        </Link>

        {user ? (
          <>
            <Link to="/projects/create"
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
              + Post Project
            </Link>

            <NotificationBell />

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2">
                <Avatar username={user.username} avatarUrl={user.avatar_url} size="sm" />
                <span className="text-sm text-surface-300">{user.username}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-surface-200 py-1 z-50">
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-black hover:bg-surface-100 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/applications" onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-black hover:bg-surface-100 transition-colors">
                    My Applications
                  </Link>
                  <Link to={`/users/${user.username}`} onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-black hover:bg-surface-100 transition-colors">
                    My Profile
                  </Link>
                  <Link to="/profile/edit" onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-black hover:bg-surface-100 transition-colors">
                    Edit Profile
                  </Link>
                  <div className="border-t border-surface-100 my-1" />
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-surface-300 hover:text-white transition-colors">Login</Link>
            <Link to="/register"
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
