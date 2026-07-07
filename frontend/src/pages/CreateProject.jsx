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

  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {})

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fadeInUp">
      <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-8">Post a Project</h1>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-6 border border-red-100 dark:border-red-500/20">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card rounded-2xl p-6 sm:p-8 space-y-5">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Project Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Project Title *</label>
            <input type="text" value={form.title} required
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Give your project a clear name" className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description *</label>
            <textarea value={form.description} rows={6} required
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your project, goals, and what contributors can expect..."
              className="input resize-none" />
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">Markdown supported</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input">
                {['Beginner', 'Intermediate', 'Advanced'].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                {['Recruiting', 'In Progress', 'Completed'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Repo URL (optional)</label>
            <input type="url" value={form.repo_url} placeholder="https://github.com/..."
              onChange={(e) => setForm({ ...form, repo_url: e.target.value })} className="input" />
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card rounded-2xl p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Tech Stack
          </h2>
          {Object.entries(grouped).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(grouped).map(([category, catSkills]) => (
                <div key={category}>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-surface-400 dark:text-surface-500 font-semibold mb-2">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((skill) => (
                      <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-200 ${
                          selectedSkills.includes(skill.id)
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}>
                        {selectedSkills.includes(skill.id) && '✓ '}{skill.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-surface-400 dark:text-surface-500">No skills loaded — make sure you've seeded the skills table.</p>
          )}
        </div>

        {/* Roles */}
        <div className="card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Open Roles
            </h2>
            <button type="button" onClick={addRole}
              className="text-xs text-primary-500 hover:text-primary-400 font-medium transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Role
            </button>
          </div>
          <div className="space-y-3">
            {roles.map((role, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input placeholder="Role title (e.g. Frontend Dev)" value={role.title}
                  onChange={(e) => updateRole(i, 'title', e.target.value)}
                  className="input flex-1 text-sm" />
                <input placeholder="Description (optional)" value={role.description}
                  onChange={(e) => updateRole(i, 'description', e.target.value)}
                  className="input flex-1 text-sm" />
                {roles.length > 1 && (
                  <button type="button" onClick={() => removeRole(i)}
                    className="p-2.5 text-surface-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-gradient w-full py-3 rounded-xl text-sm">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating...
            </span>
          ) : 'Post Project'}
        </button>
      </form>
    </main>
  )
}
