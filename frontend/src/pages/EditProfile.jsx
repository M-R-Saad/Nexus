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

  // Sync form when profile loads
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
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Edit Profile</h1>
        <button onClick={() => navigate(`/users/${user?.username}`)}
          className="text-sm text-surface-500 hover:text-surface-700 transition-colors">
          ← View Profile
        </button>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 mb-5">
        <h2 className="text-sm font-semibold text-surface-700 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <Avatar username={user?.username} avatarUrl={user?.avatar_url} size="lg" />
          <div>
            <button onClick={() => fileRef.current.click()} disabled={avatarLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              {avatarLoading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <p className="text-xs text-surface-400 mt-1">JPEG, PNG or WebP — max 5MB</p>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange} className="hidden" />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 mb-5">
        <h2 className="text-sm font-semibold text-surface-700 mb-4">Profile Info</h2>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">Profile updated successfully.</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">Email</label>
            <input type="email" value={profile?.email || ''} disabled
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm bg-surface-50 text-surface-400 cursor-not-allowed" />
            <p className="text-xs text-surface-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">Username</label>
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3} placeholder="Tell other developers about yourself..."
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">GitHub URL</label>
            <input type="url" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              placeholder="https://github.com/yourusername"
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">Portfolio URL</label>
            <input type="url" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
              placeholder="https://yourportfolio.com"
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>

          <button type="submit" disabled={updateMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <h2 className="text-sm font-semibold text-surface-700 mb-1">Skills</h2>
        <p className="text-xs text-surface-400 mb-4">Click to add or remove skills from your profile</p>

        {/* My current skills */}
        {profile?.user_skills?.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-medium text-surface-500 mb-2">Your skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.user_skills.map((us) => (
                <button key={us.id} onClick={() => removeSkillMutation.mutate(us.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-medium hover:bg-red-100 hover:text-red-600 transition-colors group">
                  <SkillTag name={us.skill.name} category={us.skill.category} />
                  <span className="group-hover:inline hidden text-xs">✕</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add skills grouped by category */}
        {Object.entries(grouped).map(([category, skills]) => (
          <div key={category} className="mb-4">
            <p className="text-xs font-medium text-surface-400 mb-2">{category}</p>
            <div className="flex flex-wrap gap-2">
              {skills.filter((s) => !mySkillIds.includes(s.id)).map((skill) => (
                <button key={skill.id}
                  onClick={() => addSkillMutation.mutate({ skill_id: skill.id, proficiency: 'Intermediate' })}
                  className="text-xs px-3 py-1.5 rounded-full border border-surface-200 text-surface-600 hover:border-primary-400 hover:text-primary-600 transition-colors">
                  + {skill.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
