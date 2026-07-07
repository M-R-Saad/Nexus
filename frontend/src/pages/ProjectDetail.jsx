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

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) setShowApplyModal(false)
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="skeleton h-64 rounded-2xl mb-6" />
        <div className="skeleton h-40 rounded-2xl mb-6" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    )
  }
  if (!project) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-surface-700 dark:text-surface-300">Project not found</p>
      </div>
    )
  }

  const openRoles = project.roles?.filter((r) => !r.is_filled) || []
  const isOwner = user?.id === project.owner?.id
  const isMember = project.members?.some((m) => m.user.id === user?.id)
  const canApply = user && !isOwner && !isMember && !applySuccess && openRoles.length > 0

  const tabs = [
    { key: 'about', label: 'About' },
    ...(isOwner ? [{ key: 'applicants', label: `Applicants (${applications.length})` }] : []),
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-fadeInUp">

      {/* ── Header Card ── */}
      <div className="card rounded-2xl p-6 sm:p-8">
          {/* Project avatar */}
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center mb-5">
            <span className="text-2xl font-bold gradient-text">{project.title[0]}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-2">{project.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Link to={`/users/${project.owner?.username}`} className="flex items-center gap-2 group">
                  <Avatar username={project.owner?.username} avatarUrl={project.owner?.avatar_url} size="xs" />
                  <span className="text-sm text-surface-500 dark:text-surface-400 group-hover:text-primary-500 transition-colors">
                    {project.owner?.username}
                  </span>
                </Link>
                <span className="badge-info">
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  {project.status}
                </span>
                <span className="text-xs font-medium text-surface-400 dark:text-surface-500">
                  {project.difficulty}
                </span>
                {project.repo_url && (
                  <a href={project.repo_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Repository
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {canApply && (
                <button onClick={() => setShowApplyModal(true)} className="btn-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Apply to Join
                </button>
              )}
              {user && (
                <button onClick={handleBookmark}
                  className={`btn-secondary ${project.is_bookmarked ? 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-600' : ''}`}>
                  <svg className="w-4 h-4" fill={project.is_bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {project.is_bookmarked ? 'Saved' : 'Save'}
                </button>
              )}
              {(isOwner || isMember) && (
                <Link to={`/workspace/${id}`} className="btn-gradient">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Workspace
                </Link>
              )}
            </div>
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2">
            {project.tech_stack?.map((skill) => (
              <SkillTag key={skill.id} name={skill.name} category={skill.category} />
            ))}
          </div>
      </div>

      {/* ── Tab Switcher ── */}
      {tabs.length > 1 && (
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800/50 rounded-xl p-1">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm'
                  : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── About Tab ── */}
      {activeTab === 'about' && (
        <>
          {/* Description */}
          <div className="card rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              About
            </h2>
            <div className="prose prose-sm max-w-none text-surface-700 dark:text-surface-300 whitespace-pre-wrap leading-relaxed">
              {project.description}
            </div>
          </div>

          {/* Open Roles */}
          {project.roles?.length > 0 && (
            <div className="card rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Open Roles
                </h2>
                {canApply && (
                  <button onClick={() => setShowApplyModal(true)}
                    className="text-xs text-primary-500 hover:text-primary-400 font-medium transition-colors">
                    Apply now →
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {project.roles.map((role) => (
                  <div key={role.id}
                    className={`flex items-start justify-between p-4 rounded-xl border transition-colors ${
                      role.is_filled
                        ? 'border-surface-100 dark:border-surface-800 opacity-50'
                        : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}>
                    <div>
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{role.title}</p>
                      {role.description && <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{role.description}</p>}
                    </div>
                    <span className={`badge ml-4 shrink-0 ${role.is_filled ? 'bg-surface-100 dark:bg-surface-800 text-surface-400' : 'badge-success'}`}>
                      {role.is_filled ? 'Filled' : 'Open'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team members */}
          {project.members?.length > 0 && (
            <div className="card rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Team ({project.members.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.members.map((m) => (
                  <Link key={m.id} to={`/users/${m.user.username}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors group">
                    <Avatar username={m.user.username} avatarUrl={m.user.avatar_url} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {m.user.username}
                      </p>
                      {m.role && <p className="text-xs text-surface-400 dark:text-surface-500">{m.role.title}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Applicants Tab (owner) ── */}
      {isOwner && activeTab === 'applicants' && (
        <div className="card rounded-2xl p-6 sm:p-8">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-surface-600 dark:text-surface-300">No applications yet</p>
              <p className="text-xs text-surface-400 mt-1">Applications will appear here when developers apply.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar username={app.applicant?.username} avatarUrl={app.applicant?.avatar_url} size="sm" />
                      <div>
                        <Link to={`/users/${app.applicant?.username}`}
                          className="text-sm font-semibold text-surface-900 dark:text-surface-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          {app.applicant?.username}
                        </Link>
                        <p className="text-xs text-surface-400 dark:text-surface-500">
                          Applied for <span className="text-surface-600 dark:text-surface-300 font-medium">{app.role?.title}</span>
                        </p>
                      </div>
                    </div>
                    {app.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => decideMutation.mutate({ appId: app.id, status: 'Accepted' })}
                          disabled={decideMutation.isPending}
                          className="btn-primary text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700">
                          Accept
                        </button>
                        <button onClick={() => decideMutation.mutate({ appId: app.id, status: 'Rejected' })}
                          disabled={decideMutation.isPending}
                          className="btn-secondary text-xs px-3 py-1.5 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-500/10">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`badge ${app.status === 'Accepted' ? 'badge-success' : 'badge-danger'}`}>
                        {app.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 pl-11 leading-relaxed">{app.pitch}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applied success banner */}
      {applySuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-500/20 animate-fadeInUp">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Application submitted! The project owner will review it soon.
        </div>
      )}

      {/* ── Apply Modal ── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={handleBackdropClick}>
          <div ref={modalRef}
            className="card rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slideUp overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-100 dark:border-surface-800">
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Apply to Join</h2>
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{project.title}</p>
              </div>
              <button onClick={() => setShowApplyModal(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {applySuccess ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-surface-900 dark:text-white font-semibold text-lg">Application Submitted!</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">The project owner will review your application.</p>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  {applyError && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 border border-red-100 dark:border-red-500/20">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {applyError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Select a Role</label>
                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
                      required className="input">
                      <option value="">Choose a role to apply for...</option>
                      {openRoles.map((r) => (
                        <option key={r.id} value={r.id}>{r.title}{r.description ? ` — ${r.description}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Your Pitch</label>
                    <textarea value={pitch} onChange={(e) => setPitch(e.target.value)}
                      placeholder="Why do you want to join? What skills do you bring?"
                      rows={5} required
                      className="input resize-none" />
                    <p className="text-xs text-surface-400 dark:text-surface-500 mt-1.5">Tip: Mention relevant projects or skills to stand out.</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowApplyModal(false)}
                      className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" disabled={applying}
                      className="btn-primary flex-1">
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
