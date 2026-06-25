import { Link } from 'react-router-dom'
import { toggleBookmark } from '../../api/projects'
import { useAuth } from '../../hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import SkillTag from '../ui/SkillTag'
import Avatar from '../ui/Avatar'

const STATUS_COLORS = {
  Recruiting: 'bg-green-100 text-green-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-surface-100 text-surface-500',
  Archived: 'bg-surface-100 text-surface-400',
}

export default function ProjectCard({ project }) {
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
  }

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-white rounded-xl border border-surface-200 hover:border-primary-500 hover:shadow-md transition-all p-5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status] || ''}`}>
          {project.status}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400">{project.difficulty}</span>
          {user && (
            <button
              onClick={handleBookmark}
              className={`text-sm transition-colors ${
                project.is_bookmarked
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-surface-300 hover:text-yellow-500'
              }`}
              title={project.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              {project.is_bookmarked ? '★' : '☆'}
            </button>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors mb-1 line-clamp-1">
        {project.title}
      </h3>

      <div className="flex items-center gap-2 mb-3">
        <Avatar username={project.owner?.username} avatarUrl={project.owner?.avatar_url} size="sm" />
        <span className="text-xs text-surface-500">{project.owner?.username}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.tech_stack?.slice(0, 4).map((skill) => (
          <SkillTag key={skill.id} name={skill.name} category={skill.category} />
        ))}
        {project.tech_stack?.length > 4 && (
          <span className="text-xs text-surface-400">+{project.tech_stack.length - 4}</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-surface-400">
        <span>{project.member_count} members</span>
        <span>{project.open_roles_count} open roles</span>
      </div>
    </Link>
  )
}

