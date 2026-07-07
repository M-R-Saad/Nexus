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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-36 rounded-2xl" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-surface-700 dark:text-surface-300">User not found</p>
      </div>
    )
  }

  const isOwnProfile = user?.username === username
  const grouped = (data.user_skills || []).reduce((acc, us) => {
    const cat = us.skill.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(us)
    return acc
  }, {})

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5 animate-fadeInUp">

      {/* Header card */}
      <div className="card rounded-2xl p-6 sm:p-8">
          <div className="flex items-start justify-between mb-4">
            <Avatar username={data.username} avatarUrl={data.avatar_url} size="xl"
              className="ring-4 ring-surface-100 dark:ring-surface-800 !w-20 !h-20" />
            {isOwnProfile && (
              <Link to="/profile/edit" className="btn-secondary text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </Link>
            )}
          </div>

          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{data.username}</h1>
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
            Member since {new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>

          <div className="flex items-center gap-3 mt-3">
            {data.github_url && (
              <a href={data.github_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            )}
            {data.portfolio_url && (
              <a href={data.portfolio_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Portfolio
              </a>
            )}
          </div>

          {data.bio && (
            <p className="text-surface-600 dark:text-surface-300 mt-5 leading-relaxed">{data.bio}</p>
          )}
          {!data.bio && isOwnProfile && (
            <p className="text-surface-400 dark:text-surface-500 mt-5 text-sm italic">
              No bio yet. <Link to="/profile/edit" className="text-primary-500 hover:underline">Add one</Link>
            </p>
          )}
      </div>

      {/* Skills */}
      {data.user_skills?.length > 0 ? (
        <div className="card rounded-2xl p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Skills & Expertise
          </h2>
          <div className="space-y-5">
            {Object.entries(grouped).map(([category, skills]) => (
              <div key={category}>
                <p className="text-[10px] uppercase tracking-[0.15em] text-surface-400 dark:text-surface-500 font-semibold mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((us) => (
                    <div key={us.id} className="flex items-center gap-1.5">
                      <SkillTag name={us.skill.name} category={us.skill.category} />
                      <span className="text-[10px] text-surface-400 dark:text-surface-500 font-medium">{us.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isOwnProfile ? (
        <div className="card rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">No skills added yet.</p>
          <Link to="/profile/edit" className="btn-primary text-sm">Add Skills</Link>
        </div>
      ) : null}
    </main>
  )
}
