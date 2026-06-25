import api from './axios'

export const register = (data) => api.post('/auth/register/', data)
export const login = (data) => api.post('/auth/login/', data)
export const refreshToken = (data) => api.post('/auth/refresh/', data)
export const logout = (refresh) => api.post('/auth/logout/', { refresh })
export const getMe = () => api.get('/users/me/')
export const updateMe = (data) => api.patch('/users/me/', data)
export const getPublicProfile = (username) => api.get(`/users/${username}/`)
export const getAllSkills = () => api.get('/users/skills/')
export const addUserSkill = (data) => api.post('/users/me/skills/', data)
export const deleteUserSkill = (id) => api.delete(`/users/me/skills/${id}/`)
