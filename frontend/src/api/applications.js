import api from './axios'

// Re-export from projects for backwards compat
export { applyToProject, getProjectApplications } from './projects'

export const decideApplication = (id, status) =>
  api.patch(`/applications/${id}/decide/`, { status })

export const getMyApplications = () => api.get('/applications/mine/')
