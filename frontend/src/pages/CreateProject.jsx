import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject } from '../api/projects'
import { getAllSkills } from '../api/auth'
import { useQuery } from '@tanstack/react-query'

export default function CreateProject() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', difficulty: 'Intermediate', status: 'Recruiting', repo_url: '',
  })
  const [roles, setRoles] = useState([{ title: '', description: '' }])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: () => getAllSkills().then((r) => r.data),
  })
  const skills = skillsData?.results || skillsData || []

  const toggleSkill = (id) =>
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )

  const addRole = () => setRoles((prev) => [...prev, { title: '', description: '' }])
  const removeRole = (i) => setRoles((prev) => prev.filter((_, idx) => idx !== i))
  const updateRole = (i, field, value) =>
    setRoles((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await createProject({
        ...form,
        tech_stack_ids: selectedSkills,
        roles_input: roles.filter((r) => r.title.trim()),
      })
      navigate(`/projects/${data.id}`)
    } catch (err) {
      const d = err.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Failed to create project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-surface-900 mb-8">Post a Project</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Project Title *</label>
          <input
            type="text" value={form.title} required
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Description * (Markdown supported)</label>
          <textarea
            value={form.description} rows={6} required
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
          />
        </div>

        {/* Difficulty + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Difficulty</label>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              {['Beginner', 'Intermediate', 'Advanced'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              {['Recruiting', 'In Progress', 'Completed'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Tech Stack</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <button
                key={skill.id} type="button" onClick={() => toggleSkill(skill.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedSkills.includes(skill.id)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-surface-200 text-surface-600 hover:border-primary-400'
                }`}>
                {skill.name}
              </button>
            ))}
          </div>
          {skills.length === 0 && (
            <p className="text-xs text-surface-400 mt-1">No skills loaded — make sure you've seeded the skills table.</p>
          )}
        </div>

        {/* Open Roles */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-surface-700">Open Roles</label>
            <button type="button" onClick={addRole}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              + Add Role
            </button>
          </div>
          <div className="space-y-3">
            {roles.map((role, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Role title (e.g. Frontend Dev)"
                  value={role.title}
                  onChange={(e) => updateRole(i, 'title', e.target.value)}
                  className="flex-1 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <input
                  placeholder="Short description (optional)"
                  value={role.description}
                  onChange={(e) => updateRole(i, 'description', e.target.value)}
                  className="flex-1 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
                {roles.length > 1 && (
                  <button type="button" onClick={() => removeRole(i)}
                    className="text-surface-400 hover:text-red-500 px-2 transition-colors">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Repo URL */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Repo URL (optional)</label>
          <input
            type="url" value={form.repo_url} placeholder="https://github.com/..."
            onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
            className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50">
          {loading ? 'Creating...' : 'Post Project'}
        </button>
      </form>
    </main>
  )
}
