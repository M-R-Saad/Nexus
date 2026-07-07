import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMyApplications } from '../api/applications'
import { useAuth } from '../hooks/useAuth'
import Avatar from '../components/ui/Avatar'

const STATUS_CONFIG = {
  Pending: { badge: 'badge-warning', icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  Accepted: { badge: 'badge-success', icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> },
  Rejected: { badge: 'badge-danger', icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> },
}

export default function MyApplications() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => getMyApplications().then((r) => r.data),
  })

  const applications = data?.results || data || []
  const filtered = statusFilter === 'all'
    ? applications
    : applications.filter((a) => a.status === statusFilter)

  const counts = {
    all: applications.length,
    Pending: applications.filter((a) => a.status === 'Pending').length,
    Accepted: applications.filter((a) => a.status === 'Accepted').length,
    Rejected: applications.filter((a) => a.status === 'Rejected').length,
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fadeInUp">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-2">My Applications</h1>
        <p className="text-surface-500 dark:text-surface-400">Track all the projects you've applied to join.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800/50 rounded-xl p-1 mb-8">
        {['all', 'Pending', 'Accepted', 'Rejected'].map((tab) => (
          <button key={tab} onClick={() => setStatusFilter(tab)}
            className={`flex-1 text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-200 ${
              statusFilter === tab
                ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
            }`}>
            {tab === 'all' ? 'All' : tab}
            <span className="ml-1.5 text-xs opacity-60">({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 animate-fadeInUp">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-1">
            {statusFilter === 'all' ? 'No applications yet' : `No ${statusFilter.toLowerCase()} applications`}
          </h3>
          <p className="text-sm text-surface-400 dark:text-surface-500 mb-4">
            {statusFilter === 'all' ? 'Find a project and submit an application.' : 'Try a different filter.'}
          </p>
          {statusFilter === 'all' && <Link to="/discover" className="btn-primary text-sm">Discover Projects</Link>}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.Pending
            return (
              <div key={app.id} className="card rounded-2xl p-5 hover:scale-[1.005] transition-transform duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link to={`/projects/${app.project?.id}`}
                      className="text-base font-semibold text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {app.project?.title || 'Unknown Project'}
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400 mt-1.5">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {app.role?.title}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 line-clamp-2">{app.pitch}</p>
                  </div>
                  <span className={`badge ${config.badge} shrink-0 gap-1`}>
                    {config.icon}
                    {app.status}
                  </span>
                </div>

                {app.project?.owner && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-100 dark:border-surface-800">
                    <Avatar username={app.project.owner?.username} avatarUrl={app.project.owner?.avatar_url} size="xs" />
                    <span className="text-xs text-surface-400 dark:text-surface-500">
                      by <Link to={`/users/${app.project.owner?.username}`}
                        className="hover:text-primary-500 transition-colors font-medium">{app.project.owner?.username}</Link>
                    </span>
                    {app.project?.tech_stack?.slice(0, 3).map((skill) => (
                      <span key={skill.id} className="text-[10px] bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 px-2 py-0.5 rounded-full font-medium">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
