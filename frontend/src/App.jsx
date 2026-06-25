import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Navbar from './components/layout/Navbar'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Dashboard from './pages/Dashboard'
import Discover from './pages/Discover'
import ProjectDetail from './pages/ProjectDetail'
import CreateProject from './pages/CreateProject'
import MyApplications from './pages/MyApplications'
import Notifications from './pages/Notifications'
import WorkspaceLayout from './pages/workspace/WorkspaceLayout'
import KanbanBoard from './pages/workspace/KanbanBoard'
import TeamChat from './pages/workspace/TeamChat'
import ActivityPage from './pages/workspace/ActivityPage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/users/:username" element={<Profile />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile/edit" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
        <Route path="/projects/create" element={<PrivateRoute><CreateProject /></PrivateRoute>} />
        <Route path="/applications" element={<PrivateRoute><MyApplications /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/workspace/:projectId" element={<PrivateRoute><WorkspaceLayout /></PrivateRoute>}>
          <Route index element={<KanbanBoard />} />
          <Route path="kanban" element={<KanbanBoard />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="chat" element={<TeamChat />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  )
}
