import { Link } from 'react-router-dom'
import { toggleBookmark } from '../../api/projects'
import { useAuth } from '../../hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import SkillTag from '../ui/SkillTag'
import Avatar from '../ui/Avatar'

const STATUS_CONFIG = {
  Recruiting: { label: 'Recruiting', dot: 'bg-emerald-500', badge: 'badge-success' },
  'In Progress': { label: 'In Progress', dot: 'bg-blue-500', badge: 'badge-info' },
  Completed: { label: 'Completed', dot: 'bg-surface-400', badge: 'bg-surface-100 text-surface-500 dark:bg-surface-700/50 dark:text-surface-400' },
  Archived: { label: 'Archived', dot: 'bg-surface-300', badge: 'bg-surface-100 text-surface-400 dark:bg-surface-800 dark:text-surface-500' },
}

const DIFFICULTY_CONFIG = {
  Beginner: 'text-emerald-600 dark:text-emerald-400',
  Intermediate: 'text-amber-600 dark:text-amber-400',
  Advanced: 'text-red-600 dark:text-red-400',
}

export default function ProjectCard({ project, className = '' }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    await toggleBookmark(project.id)
    queryClient.invalidateQueries(['projects'])
    queryClient.invalidateQueries(['dashboard'])
    queryClient.invalidateQueries(['trending-projects'])
    queryClient.invalidateQueries(['trending'])
  }

  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.Recruiting

  return (
    <Link
      to={`/projects/${project.id}`}
      className={`card-glow group block rounded-2xl p-5 animate-fadeInUp ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={`badge ${status.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${DIFFICULTY_CONFIG[project.difficulty] || ''}`}>
            {project.difficulty}
          </span>
          {user && (
            <button
              onClick={handleBookmark}
              className={`p-1 rounded-lg transition-all duration-200 ${
                project.is_bookmarked
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-surface-300 dark:text-surface-600 hover:text-amber-500'
              }`}
              title={project.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <svg className={`w-4 h-4 transition-transform duration-200 ${project.is_bookmarked ? 'scale-110' : 'group-hover:scale-110'}`}
                fill={project.is_bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 mb-2 line-clamp-1">
        {project.title}
      </h3>

      {/* Owner */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar username={project.owner?.username} avatarUrl={project.owner?.avatar_url} size="xs" />
        <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">
          {project.owner?.username}
        </span>
      </div>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.tech_stack?.slice(0, 4).map((skill) => (
          <SkillTag key={skill.id} name={skill.name} category={skill.category} />
        ))}
        {project.tech_stack?.length > 4 && (
          <span className="text-xs text-surface-400 dark:text-surface-500 font-medium self-center">
            +{project.tech_stack.length - 4}
          </span>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-4 text-xs text-surface-400 dark:text-surface-500 font-medium pt-3 border-t border-surface-100 dark:border-surface-800">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {project.member_count} members
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {project.open_roles_count} open roles
        </span>
      </div>
    </Link>
  )
}
