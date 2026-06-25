import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPublicProfile } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import Avatar from '../components/ui/Avatar'
import SkillTag from '../components/ui/SkillTag'

export default function Profile() {
  const { username } = useParams()
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => getPublicProfile(username).then((r) => r.data),
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
        <div className="bg-surface-100 rounded-2xl h-40 animate-pulse" />
        <div className="bg-surface-100 rounded-2xl h-32 animate-pulse" />
      </div>
    )
  }

  if (!data) return <p className="text-center py-20 text-surface-400">User not found.</p>

  const isOwnProfile = user?.username === username
  const grouped = (data.user_skills || []).reduce((acc, us) => {
    const cat = us.skill.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(us)
    return acc
  }, {})

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 space-y-5">

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-surface-200 p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <Avatar username={data.username} avatarUrl={data.avatar_url} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-surface-900">{data.username}</h1>
              <p className="text-xs text-surface-400 mt-0.5">
                Member since {new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <div className="flex items-center gap-3 mt-2">
                {data.github_url && (
                  <a href={data.github_url} target="_blank" rel="noreferrer"
                    className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                    GitHub ↗
                  </a>
                )}
                {data.portfolio_url && (
                  <a href={data.portfolio_url} target="_blank" rel="noreferrer"
                    className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                    Portfolio ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <Link to="/profile/edit"
              className="text-sm border border-surface-200 hover:border-primary-500 text-surface-700 px-4 py-2 rounded-lg transition-colors">
              Edit Profile
            </Link>
          )}
        </div>

        {data.bio && (
          <p className="text-surface-600 mt-5 leading-relaxed">{data.bio}</p>
        )}

        {!data.bio && isOwnProfile && (
          <p className="text-surface-400 mt-5 text-sm italic">
            No bio yet. <Link to="/profile/edit" className="text-primary-600 hover:underline">Add one</Link>
          </p>
        )}
      </div>

      {/* Skills */}
      {data.user_skills?.length > 0 ? (
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-4">Skills</h2>
          <div className="space-y-4">
            {Object.entries(grouped).map(([category, skills]) => (
              <div key={category}>
                <p className="text-xs font-medium text-surface-400 mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((us) => (
                    <div key={us.id} className="flex items-center gap-1.5">
                      <SkillTag name={us.skill.name} category={us.skill.category} />
                      <span className="text-xs text-surface-300">{us.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isOwnProfile ? (
        <div className="bg-white rounded-2xl border border-surface-200 p-6 text-center">
          <p className="text-surface-400 text-sm mb-3">No skills added yet.</p>
          <Link to="/profile/edit"
            className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
            Add Skills
          </Link>
        </div>
      ) : null}

    </main>
  )
}
