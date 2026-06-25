import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMyApplications } from '../api/applications'
import { useAuth } from '../hooks/useAuth'
import Avatar from '../components/ui/Avatar'

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-600',
}

const STATUS_ICONS = {
  Pending: '⏳',
  Accepted: '✓',
  Rejected: '✕',
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
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 mb-2">My Applications</h1>
        <p className="text-surface-500">Track all the projects you've applied to join.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { key: 'all', label: 'Total', color: 'text-surface-600' },
          { key: 'Pending', label: 'Pending', color: 'text-yellow-600' },
          { key: 'Accepted', label: 'Accepted', color: 'text-green-600' },
          { key: 'Rejected', label: 'Rejected', color: 'text-red-500' },
        ].map(({ key, label, color }) => (
          <div key={key} className="bg-white rounded-xl border border-surface-200 p-4">
            <p className="text-2xl font-bold text-surface-900">{counts[key]}</p>
            <p className={`text-sm mt-0.5 ${color}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-surface-100 mb-6">
        {['all', 'Pending', 'Accepted', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`text-sm px-4 py-2.5 capitalize transition-colors ${
              statusFilter === tab
                ? 'border-b-2 border-primary-600 text-primary-600 font-medium -mb-px'
                : 'text-surface-400 hover:text-surface-600'
            }`}
          >
            {tab === 'all' ? 'All' : tab}
            <span className="ml-1.5 text-xs opacity-70">({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-surface-100 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-surface-400 text-lg mb-1">
            {statusFilter === 'all' ? 'No applications yet' : `No ${statusFilter.toLowerCase()} applications`}
          </p>
          <p className="text-surface-300 text-sm mb-4">
            {statusFilter === 'all'
              ? "Find a project that interests you and submit an application."
              : "Try a different filter or apply to more projects."}
          </p>
          {statusFilter === 'all' && (
            <Link to="/discover"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white text-sm px-5 py-2.5 rounded-lg transition-colors">
              Discover Projects
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-surface-200 hover:border-surface-300 transition-colors p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/projects/${app.project?.id}`}
                      className="text-base font-semibold text-surface-900 hover:text-primary-600 transition-colors truncate"
                    >
                      {app.project?.title || 'Unknown Project'}
                    </Link>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-surface-500 mb-3">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {app.role?.title}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(app.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Pitch preview */}
                  <p className="text-sm text-surface-600 line-clamp-2">{app.pitch}</p>
                </div>

                <span className={`text-xs px-3 py-1.5 rounded-full font-medium shrink-0 flex items-center gap-1.5 ${STATUS_COLORS[app.status] || ''}`}>
                  <span>{STATUS_ICONS[app.status]}</span>
                  {app.status}
                </span>
              </div>

              {/* Project info footer */}
              {app.project?.owner && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-100">
                  <Avatar username={app.project.owner?.username} avatarUrl={app.project.owner?.avatar_url} size="sm" />
                  <span className="text-xs text-surface-400">
                    by <Link to={`/users/${app.project.owner?.username}`} className="hover:text-primary-600 transition-colors">
                      {app.project.owner?.username}
                    </Link>
                  </span>
                  {app.project?.tech_stack?.slice(0, 3).map((skill) => (
                    <span key={skill.id} className="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full">
                      {skill.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
