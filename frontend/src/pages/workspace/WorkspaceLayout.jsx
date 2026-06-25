import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'

export default function WorkspaceLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-surface-50 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
