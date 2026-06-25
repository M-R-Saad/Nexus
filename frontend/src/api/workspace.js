import api from './axios'

export const getTasks = (projectId) => api.get(`/workspace/projects/${projectId}/tasks/`)
export const createTask = (projectId, data) => api.post(`/workspace/projects/${projectId}/tasks/`, data)
export const updateTask = (taskId, data) => api.patch(`/workspace/tasks/${taskId}/`, data)
export const deleteTask = (taskId) => api.delete(`/workspace/tasks/${taskId}/`)
export const getActivity = (projectId) => api.get(`/workspace/projects/${projectId}/activity/`)
export const getMessages = (projectId) => api.get(`/chat/projects/${projectId}/messages/`)
export const uploadTaskAttachment = (taskId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/workspace/tasks/${taskId}/attachments/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
