import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProject, toggleBookmark, applyToProject, getProjectApplications } from '../api/projects'
import { decideApplication } from '../api/applications'
import { useAuth } from '../hooks/useAuth'
import SkillTag from '../components/ui/SkillTag'
import Avatar from '../components/ui/Avatar'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [selectedRole, setSelectedRole] = useState('')
  const [pitch, setPitch] = useState('')
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [activeTab, setActiveTab] = useState('about')
  const [showApplyModal, setShowApplyModal] = useState(false)

  const modalRef = useRef(null)

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setShowApplyModal(false) }
    if (showApplyModal) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [showApplyModal])

  // Close modal on backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowApplyModal(false)
    }
  }

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id).then((r) => r.data),
  })

  const { data: applicationsData } = useQuery({
    queryKey: ['applications', id],
    queryFn: () => getProjectApplications(id).then((r) => r.data),
    enabled: !!project && user?.id === project?.owner?.id,
  })
  const applications = applicationsData?.results || applicationsData || []

  const decideMutation = useMutation({
    mutationFn: ({ appId, status }) => decideApplication(appId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['applications', id])
      queryClient.invalidateQueries(['project', id])
    },
  })

  const handleApply = async (e) => {
    e.preventDefault()
    setApplying(true)
    setApplyError('')
    try {
      await applyToProject(id, { role_id: selectedRole, pitch })
      setApplySuccess(true)
      setPitch('')
      setSelectedRole('')
      // Close modal after a brief delay so user sees success state
      setTimeout(() => setShowApplyModal(false), 1500)
    } catch (err) {
      setApplyError(err.response?.data?.error || 'Application failed.')
    } finally {
      setApplying(false)
    }
  }

  const handleBookmark = async () => {
    await toggleBookmark(id)
    queryClient.invalidateQueries(['project', id])
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-surface-100 rounded-2xl h-96 animate-pulse" />
      </div>
    )
  }
  if (!project) return <p className="text-center py-20 text-surface-400">Project not found.</p>

  const openRoles = project.roles?.filter((r) => !r.is_filled) || []
  const isOwner = user?.id === project.owner?.id
  const isMember = project.members?.some((m) => m.user.id === user?.id)
  const canApply = user && !isOwner && !isMember && !applySuccess && openRoles.length > 0

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-surface-200 p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 mb-2">{project.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to={`/users/${project.owner?.username}`} className="flex items-center gap-2 hover:underline">
                <Avatar username={project.owner?.username} avatarUrl={project.owner?.avatar_url} size="sm" />
                <span className="text-sm text-surface-500">{project.owner?.username}</span>
              </Link>
              <span className="text-xs bg-surface-100 text-surface-600 px-2.5 py-0.5 rounded-full">{project.status}</span>
              <span className="text-xs text-surface-400">{project.difficulty}</span>
              {project.repo_url && (
                <a href={project.repo_url} target="_blank" rel="noreferrer"
                  className="text-xs text-primary-600 hover:underline">
                  View Repo ↗
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            {canApply && (
              <button onClick={() => setShowApplyModal(true)}
                className="text-sm px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
                Apply to Join
              </button>
            )}
            {user && (
              <button onClick={handleBookmark}
                className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                  project.is_bookmarked
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                    : 'border-surface-200 text-surface-500 hover:border-primary-400'
                }`}>
                {project.is_bookmarked ? '★ Saved' : '☆ Save'}
              </button>
            )}
            {(isOwner || isMember) && (
              <Link to={`/workspace/${id}`}
                className="text-sm px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                Open Workspace
              </Link>
            )}
          </div>
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech_stack?.map((skill) => (
            <SkillTag key={skill.id} name={skill.name} category={skill.category} />
          ))}
        </div>

        {/* Owner tab switcher */}
        {isOwner && (
          <div className="flex gap-1 border-b border-surface-100 mb-4">
            {['about', 'applicants'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`text-sm px-4 py-2 capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-primary-600 text-primary-600 font-medium -mb-px'
                    : 'text-surface-400 hover:text-surface-600'
                }`}>
                {tab}{tab === 'applicants' ? ` (${applications.length})` : ''}
              </button>
            ))}
          </div>
        )}

        {/* Description */}
        {(!isOwner || activeTab === 'about') && (
          <div className="prose prose-sm max-w-none text-surface-700 whitespace-pre-wrap">
            {project.description}
          </div>
        )}

        {/* Applicants tab (owner only) */}
        {isOwner && activeTab === 'applicants' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <p className="text-surface-400 text-sm text-center py-8">No applications yet.</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="border border-surface-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar username={app.applicant?.username} avatarUrl={app.applicant?.avatar_url} size="sm" />
                      <div>
                        <Link to={`/users/${app.applicant?.username}`} className="text-sm font-medium text-surface-900 hover:underline">
                          {app.applicant?.username}
                        </Link>
                        <p className="text-xs text-surface-400">for: {app.role?.title}</p>
                      </div>
                    </div>
                    {app.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => decideMutation.mutate({ appId: app.id, status: 'Accepted' })}
                          disabled={decideMutation.isPending}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                          Accept
                        </button>
                        <button onClick={() => decideMutation.mutate({ appId: app.id, status: 'Rejected' })}
                          disabled={decideMutation.isPending}
                          className="text-xs border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        app.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {app.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-600 mt-3 pl-9">{app.pitch}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Open Roles */}
      {project.roles?.length > 0 && (!isOwner || activeTab === 'about') && (
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">Open Roles</h2>
            {canApply && (
              <button onClick={() => setShowApplyModal(true)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Apply now →
              </button>
            )}
          </div>
          <div className="space-y-3">
            {project.roles.map((role) => (
              <div key={role.id}
                className={`flex items-start justify-between p-3 rounded-lg border ${
                  role.is_filled ? 'border-surface-100 opacity-60' : 'border-surface-200'
                }`}>
                <div>
                  <p className="text-sm font-medium text-surface-800">{role.title}</p>
                  {role.description && <p className="text-xs text-surface-500 mt-0.5">{role.description}</p>}
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full ml-4 shrink-0 ${
                  role.is_filled ? 'bg-surface-100 text-surface-400' : 'bg-green-100 text-green-700'
                }`}>
                  {role.is_filled ? 'Filled' : 'Open'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team members */}
      {project.members?.length > 0 && (
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Team</h2>
          <div className="flex flex-wrap gap-3">
            {project.members.map((m) => (
              <Link key={m.id} to={`/users/${m.user.username}`}
                className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 hover:border-primary-400 transition-colors">
                <Avatar username={m.user.username} avatarUrl={m.user.avatar_url} size="sm" />
                <div>
                  <p className="text-sm font-medium text-surface-800">{m.user.username}</p>
                  {m.role && <p className="text-xs text-surface-400">{m.role.title}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Applied success banner (visible after modal closes) */}
      {applySuccess && (
        <div className="bg-green-50 text-green-700 rounded-2xl p-6 text-center font-medium">
          ✓ Application submitted! The project owner will review it soon.
        </div>
      )}

      {/* ── Apply Modal ── */}
      {showApplyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-[slideUp_0.2s_ease-out]"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-100">
              <div>
                <h2 className="text-lg font-semibold text-surface-900">Apply to Join</h2>
                <p className="text-xs text-surface-400 mt-0.5">{project.title}</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-surface-400 hover:text-surface-600 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5">
              {applySuccess ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-surface-900 font-medium">Application Submitted!</p>
                  <p className="text-sm text-surface-500 mt-1">The project owner will review your application.</p>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  {applyError && (
                    <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{applyError}</div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Select a Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      required
                      className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">Choose a role to apply for...</option>
                      {openRoles.map((r) => (
                        <option key={r.id} value={r.id}>{r.title}{r.description ? ` — ${r.description}` : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Your Pitch</label>
                    <textarea
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      placeholder="Why do you want to join? What skills and experience do you bring?"
                      rows={5}
                      required
                      className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                    />
                    <p className="text-xs text-surface-400 mt-1">Tip: Mention relevant projects or skills to stand out.</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="flex-1 border border-surface-200 text-surface-600 py-2.5 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
