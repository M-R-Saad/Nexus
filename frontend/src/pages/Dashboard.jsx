import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { toggleBookmark } from '../api/projects'
import api from '../api/axios'

const STAT_ICONS = [
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
]

const STAT_COLORS = [
  'from-primary-500 to-primary-600',
  'from-blue-500 to-cyan-500',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
]

function StatCard({ label, value, index }) {
  return (
    <div className="card rounded-2xl p-5 group hover:scale-[1.02] transition-transform duration-200">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${STAT_COLORS[index]} flex items-center justify-center text-white mb-3 shadow-sm`}>
        {STAT_ICONS[index]}
      </div>
      <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
      <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 font-medium">{label}</p>
    </div>
  )
}

const statusConfig = {
  Recruiting: 'badge-success',
  'In Progress': 'badge-info',
  Completed: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
  Archived: 'bg-surface-100 text-surface-400 dark:bg-surface-800 dark:text-surface-500',
}

const appStatusConfig = {
  Pending: 'badge-warning',
  Accepted: 'badge-success',
  Rejected: 'badge-danger',
}

export default function Dashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/users/me/dashboard/').then((r) => r.data),
  })

  const handleUnbookmark = async (projectId) => {
    await toggleBookmark(projectId)
    queryClient.invalidateQueries(['dashboard'])
  }

  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-0.5">
            Welcome back, <span className="text-primary-600 dark:text-primary-400 font-medium">{user?.username}</span>
          </p>
        </div>
        <Link to="/projects/create" className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Projects Posted" value={data?.stats?.owned_count ?? 0} index={0} />
        <StatCard label="Projects Joined" value={data?.stats?.joined_count ?? 0} index={1} />
        <StatCard label="Pending Apps" value={data?.stats?.pending_applications ?? 0} index={2} />
        <StatCard label="Bookmarks" value={data?.stats?.bookmarks_count ?? 0} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* My Projects */}
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Projects
            </h2>
            <Link to="/projects/create" className="text-xs text-primary-500 hover:text-primary-400 font-medium">+ New</Link>
          </div>
          {data?.owned_projects?.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-surface-400 dark:text-surface-500 text-sm mb-3">No projects yet.</p>
              <Link to="/projects/create" className="btn-primary text-sm">Post your first project</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.owned_projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                      {p.title}
                    </p>
                    <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge ${statusConfig[p.status] || ''} ml-3 shrink-0`}>
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Joined Projects */}
        <div className="card rounded-2xl p-6">
          <h2 className="text-base font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Joined Projects
          </h2>
          {data?.joined_projects?.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-surface-400 dark:text-surface-500 text-sm mb-3">Haven't joined any projects.</p>
              <Link to="/discover" className="btn-primary text-sm">Discover projects</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.joined_projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                    {p.title}
                  </p>
                  <span className={`badge ${statusConfig[p.status] || ''} ml-3 shrink-0`}>{p.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks */}
        <div className="card rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Bookmarks
          </h2>
          {data?.bookmarked_projects?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-surface-400 dark:text-surface-500 text-sm">No bookmarks yet.</p>
              <p className="text-surface-300 dark:text-surface-600 text-xs mt-1">Save projects to find them later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.bookmarked_projects.map((p) => (
                <div key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-surface-200 dark:hover:border-surface-700 transition-colors group">
                  <Link to={`/projects/${p.id}`} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">{p.title}</p>
                  </Link>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className={`badge ${statusConfig[p.status] || ''}`}>{p.status}</span>
                    <button onClick={() => handleUnbookmark(p.id)}
                      className="p-1 text-amber-500 hover:text-surface-400 transition-colors" title="Remove">
                      <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Recent Applications
            </h2>
            <Link to="/applications" className="text-xs text-primary-500 hover:text-primary-400 font-medium">View all →</Link>
          </div>
          {data?.recent_applications?.length === 0 ? (
            <p className="text-surface-400 dark:text-surface-500 text-sm text-center py-8">No applications yet. Find a project and apply!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.1em] text-surface-400 dark:text-surface-500 border-b border-surface-100 dark:border-surface-800">
                    <th className="pb-3 font-semibold">Project</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Applied</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {data.recent_applications.map((a) => (
                    <tr key={a.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                      <td className="py-3">
                        <Link to={`/projects/${a.project_id}`}
                          className="text-primary-600 dark:text-primary-400 hover:underline font-medium">{a.project_title}</Link>
                      </td>
                      <td className="py-3 text-surface-600 dark:text-surface-400">{a.role}</td>
                      <td className="py-3 text-surface-400 dark:text-surface-500">{new Date(a.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className={`badge ${appStatusConfig[a.status] || ''}`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
