import { NavLink, useParams } from 'react-router-dom'

const links = [
  {
    path: 'kanban',
    label: 'Kanban Board',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
      </svg>
    ),
  },
  {
    path: 'activity',
    label: 'Activity Feed',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    path: 'chat',
    label: 'Team Chat',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const { projectId } = useParams()

  return (
    <aside className="w-56 bg-surface-900 dark:bg-surface-950 border-r border-surface-800/50 min-h-[calc(100vh-4rem)] p-3 flex flex-col gap-1">
      <p className="text-[10px] uppercase tracking-[0.15em] text-surface-500 font-semibold mb-2 px-3 pt-2">
        Workspace
      </p>
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={`/workspace/${projectId}/${link.path}`}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
              isActive
                ? 'bg-primary-600/15 text-primary-400 shadow-sm'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`transition-colors ${isActive ? 'text-primary-400' : 'text-surface-500 group-hover:text-surface-300'}`}>
                {link.icon}
              </span>
              {link.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 animate-glow-pulse" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </aside>
  )
}
