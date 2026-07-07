import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMe, updateMe, getAllSkills, addUserSkill, deleteUserSkill } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'
import Avatar from '../components/ui/Avatar'
import SkillTag from '../components/ui/SkillTag'

export default function EditProfile() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef()
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: () => getMe().then((r) => r.data),
  })

  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: () => getAllSkills().then((r) => r.data),
  })

  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    github_url: user?.github_url || '',
    portfolio_url: user?.portfolio_url || '',
  })

  useState(() => {
    if (profile) {
      setForm({
        username: profile.username || '',
        bio: profile.bio || '',
        github_url: profile.github_url || '',
        portfolio_url: profile.portfolio_url || '',
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: (data) => updateMe(data),
    onSuccess: (res) => {
      setUser(res.data)
      queryClient.invalidateQueries(['me'])
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: (err) => {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Update failed.')
    },
  })

  const addSkillMutation = useMutation({
    mutationFn: ({ skill_id, proficiency }) => addUserSkill({ skill_id, proficiency }),
    onSuccess: () => queryClient.invalidateQueries(['me']),
  })

  const removeSkillMutation = useMutation({
    mutationFn: (id) => deleteUserSkill(id),
    onSuccess: () => queryClient.invalidateQueries(['me']),
  })

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarLoading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.post('/users/me/avatar/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUser((prev) => ({ ...prev, avatar_url: res.data.avatar_url }))
      queryClient.invalidateQueries(['me'])
    } catch {
      setError('Avatar upload failed.')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    updateMutation.mutate(form)
  }

  const allSkills = skillsData?.results || skillsData || []
  const mySkillIds = profile?.user_skills?.map((us) => us.skill.id) || []

  const grouped = allSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {})

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fadeInUp">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Edit Profile</h1>
        <button onClick={() => navigate(`/users/${user?.username}`)}
          className="btn-ghost text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          View Profile
        </button>
      </div>

      {/* Avatar */}
      <div className="card rounded-2xl p-6 sm:p-8 mb-5">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Profile Photo
        </h2>
        <div className="flex items-center gap-5">
          <Avatar username={user?.username} avatarUrl={user?.avatar_url} size="lg" />
          <div>
            <button onClick={() => fileRef.current.click()} disabled={avatarLoading}
              className="btn-primary text-sm">
              {avatarLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </span>
              ) : 'Upload Photo'}
            </button>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">JPEG, PNG or WebP — max 5MB</p>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange} className="hidden" />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card rounded-2xl p-6 sm:p-8 mb-5">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-5 flex items-center gap-2">
          <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile Info
        </h2>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-5 border border-red-100 dark:border-red-500/20">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl px-4 py-3 mb-5 border border-emerald-100 dark:border-emerald-500/20 animate-fadeInUp">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Profile updated successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
            <input type="email" value={profile?.email || ''} disabled
              className="input bg-surface-50 dark:bg-surface-800 text-surface-400 dark:text-surface-500 cursor-not-allowed" />
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Username</label>
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3} placeholder="Tell other developers about yourself..."
              className="input resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">GitHub URL</label>
            <input type="url" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              placeholder="https://github.com/yourusername" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Portfolio URL</label>
            <input type="url" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
              placeholder="https://yourportfolio.com" className="input" />
          </div>
          <button type="submit" disabled={updateMutation.isPending}
            className="btn-primary">
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Skills */}
      <div className="card rounded-2xl p-6 sm:p-8">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1 flex items-center gap-2">
          <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Skills
        </h2>
        <p className="text-xs text-surface-400 dark:text-surface-500 mb-5">Click to add or remove skills</p>

        {/* Current skills */}
        {profile?.user_skills?.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-surface-400 dark:text-surface-500 font-semibold mb-2">Your skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.user_skills.map((us) => (
                <button key={us.id} onClick={() => removeSkillMutation.mutate(us.id)}
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  {us.skill.name}
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Available skills */}
        {Object.entries(grouped).map(([category, skills]) => {
          const available = skills.filter((s) => !mySkillIds.includes(s.id))
          if (available.length === 0) return null
          return (
            <div key={category} className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-surface-400 dark:text-surface-500 font-semibold mb-2">{category}</p>
              <div className="flex flex-wrap gap-2">
                {available.map((skill) => (
                  <button key={skill.id}
                    onClick={() => addSkillMutation.mutate({ skill_id: skill.id, proficiency: 'Intermediate' })}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
