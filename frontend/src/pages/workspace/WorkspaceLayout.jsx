import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'

export default function WorkspaceLayout() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 bg-surface-50 dark:bg-surface-950 overflow-auto transition-colors duration-300">
        <Outlet />
      </div>
    </div>
  )
}
