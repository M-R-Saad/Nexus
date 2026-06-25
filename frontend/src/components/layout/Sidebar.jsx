import { NavLink, useParams } from 'react-router-dom'

export default function Sidebar() {
  const { projectId } = useParams()

  const links = [
    { to: `/workspace/${projectId}/kanban`, label: 'Kanban Board' },
    { to: `/workspace/${projectId}/activity`, label: 'Activity Feed' },
    { to: `/workspace/${projectId}/chat`, label: 'Team Chat' },
  ]

  return (
    <aside className="w-52 bg-surface-900 text-surface-200 min-h-screen p-4 flex flex-col gap-1">
      <p className="text-xs uppercase tracking-widest text-surface-500 mb-3 px-3">Workspace</p>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary-600 text-white' : 'hover:bg-surface-800'}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  )
}
