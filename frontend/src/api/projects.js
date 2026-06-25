import api from './axios'

export const getProjects = (params) => api.get('/projects/', { params })
export const getTrendingProjects = () => api.get('/projects/trending/')
export const getProject = (id) => api.get(`/projects/${id}/`)
export const createProject = (data) => api.post('/projects/', data)
export const updateProject = (id, data) => api.patch(`/projects/${id}/`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}/`)
export const getProjectMembers = (id) => api.get(`/projects/${id}/members/`)
export const toggleBookmark = (id) => api.post(`/projects/${id}/bookmark/`)
export const getMyBookmarks = () => api.get('/projects/bookmarks/')

// Application endpoints (project-scoped)
export const applyToProject = (projectId, data) => api.post(`/projects/${projectId}/apply/`, data)
export const getProjectApplications = (projectId) => api.get(`/projects/${projectId}/applications/`)
