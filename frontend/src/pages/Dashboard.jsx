import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { toggleBookmark } from '../api/projects'
import api from '../api/axios'

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 p-5">
      <p className="text-2xl font-bold text-surface-900">{value}</p>
      <p className={`text-sm mt-1 ${color || 'text-surface-500'}`}>{label}</p>
    </div>
  )
}

const statusColors = {
  Recruiting: 'bg-green-100 text-green-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-surface-100 text-surface-500',
  Archived: 'bg-surface-100 text-surface-400',
}

const appStatusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-600',
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
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-surface-100 rounded-xl h-24 animate-pulse" />)}
        </div>
        <div className="bg-surface-100 rounded-2xl h-64 animate-pulse" />
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
          <p className="text-surface-500 text-sm mt-0.5">Welcome back, {user?.username}</p>
        </div>
        <Link to="/projects/create"
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2.5 rounded-lg transition-colors">
          + Post Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Projects Posted" value={data?.stats?.owned_count ?? 0} />
        <StatCard label="Projects Joined" value={data?.stats?.joined_count ?? 0} color="text-primary-600" />
        <StatCard label="Pending Applications" value={data?.stats?.pending_applications ?? 0} color="text-yellow-600" />
        <StatCard label="Bookmarks" value={data?.stats?.bookmarks_count ?? 0} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* My Posted Projects */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-surface-900">My Projects</h2>
            <Link to="/projects/create" className="text-xs text-primary-600 hover:underline">+ New</Link>
          </div>

          {data?.owned_projects?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-surface-400 text-sm mb-3">You haven't posted any projects yet.</p>
              <Link to="/projects/create"
                className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                Post your first project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.owned_projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                      {p.title}
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[p.status] || ''}`}>
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Joined Projects */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h2 className="text-base font-semibold text-surface-900 mb-4">Projects I've Joined</h2>

          {data?.joined_projects?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-surface-400 text-sm mb-3">You haven't joined any projects yet.</p>
              <Link to="/discover"
                className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                Discover projects
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.joined_projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 transition-colors group">
                  <p className="text-sm font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                    {p.title}
                  </p>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[p.status] || ''}`}>
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarked Projects */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-surface-900">Bookmarked Projects</h2>
          </div>

          {data?.bookmarked_projects?.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-surface-400 text-sm mb-1">No bookmarks yet.</p>
              <p className="text-surface-300 text-xs">Click the ☆ icon on any project card to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.bookmarked_projects.map((p) => (
                <div key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition-colors group">
                  <Link to={`/projects/${p.id}`} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 group-hover:text-primary-600 transition-colors truncate">
                      {p.title}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[p.status] || ''}`}>
                      {p.status}
                    </span>
                    <button
                      onClick={() => handleUnbookmark(p.id)}
                      className="text-yellow-500 hover:text-surface-400 text-sm transition-colors"
                      title="Remove bookmark"
                    >
                      ★
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-surface-900">Recent Applications</h2>
            <Link to="/applications" className="text-xs text-primary-600 hover:underline">View all →</Link>
          </div>

          {data?.recent_applications?.length === 0 ? (
            <p className="text-surface-400 text-sm text-center py-6">No applications yet. Find a project and apply!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-surface-400 border-b border-surface-100">
                    <th className="pb-3 font-medium">Project</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Applied</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {data.recent_applications.map((a) => (
                    <tr key={a.id} className="hover:bg-surface-50 transition-colors">
                      <td className="py-3">
                        <Link to={`/projects/${a.project_id}`} className="text-primary-600 hover:underline font-medium">
                          {a.project_title}
                        </Link>
                      </td>
                      <td className="py-3 text-surface-600">{a.role}</td>
                      <td className="py-3 text-surface-400">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${appStatusColors[a.status] || ''}`}>
                          {a.status}
                        </span>
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
