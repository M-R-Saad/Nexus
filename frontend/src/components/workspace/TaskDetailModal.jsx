import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { updateTask, deleteTask, uploadTaskAttachment } from '../../api/workspace'
import { getProjectMembers } from '../../api/projects'
import Avatar from '../ui/Avatar'

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent']
const STATUS_OPTIONS = ['Todo', 'In Progress', 'Review', 'Done']

const priorityColors = {
  Low: 'bg-surface-100 text-surface-500 dark:bg-surface-700/50 dark:text-surface-400',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
  Urgent: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
}

export default function TaskDetailModal({ task, projectId, onClose }) {
  const queryClient = useQueryClient()
  const modalRef = useRef(null)
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [status, setStatus] = useState(task.status)
  const [priority, setPriority] = useState(task.priority)
  const [deadline, setDeadline] = useState(task.deadline || '')
  const [assignedToId, setAssignedToId] = useState(task.assigned_to?.id || '')
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: membersData } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => getProjectMembers(projectId).then((r) => r.data),
  })
  const members = membersData?.results || membersData || []

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose()
  }

  const updateMutation = useMutation({
    mutationFn: (data) => updateTask(task.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId])
      queryClient.invalidateQueries(['activity', projectId])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId])
      queryClient.invalidateQueries(['activity', projectId])
      onClose()
    },
  })

  const handleSave = () => {
    const data = { title, description, status, priority, deadline: deadline || null }
    if (assignedToId !== (task.assigned_to?.id || '')) {
      data.assigned_to_id = assignedToId || null
    }
    updateMutation.mutate(data)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadTaskAttachment(task.id, file)
      queryClient.invalidateQueries(['tasks', projectId])
      queryClient.invalidateQueries(['activity', projectId])
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const hasChanges = title !== task.title || description !== (task.description || '') ||
    status !== task.status || priority !== task.priority ||
    (deadline || '') !== (task.deadline || '') ||
    assignedToId !== (task.assigned_to?.id || '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}>
      <div ref={modalRef}
        className="card rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <span className={`badge ${priorityColors[priority]}`}>{priority}</span>
            <span className="text-xs text-surface-400 dark:text-surface-500">
              Created {new Date(task.created_at).toLocaleDateString()}
            </span>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-bold text-surface-900 dark:text-white outline-none bg-transparent border-b-2 border-transparent hover:border-surface-200 dark:hover:border-surface-700 focus:border-primary-500 pb-1 transition-colors"
            placeholder="Task title" />

          {/* Description */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-surface-400 dark:text-surface-500 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} placeholder="Add a description..."
              className="input resize-none" />
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-surface-400 dark:text-surface-500 mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-surface-400 dark:text-surface-500 mb-1.5">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input">
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-surface-400 dark:text-surface-500 mb-1.5">Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-surface-400 dark:text-surface-500 mb-1.5">Assignee</label>
              <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className="input">
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m.user.id} value={m.user.id}>{m.user.username}</option>)}
              </select>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] uppercase tracking-[0.15em] font-semibold text-surface-400 dark:text-surface-500 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attachments ({task.attachments?.length || 0})
              </label>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="text-xs text-primary-500 hover:text-primary-400 font-medium disabled:opacity-50 transition-colors">
                {uploading ? 'Uploading...' : '+ Upload'}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
            </div>

            {task.attachments?.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((att) => (
                  <a key={att.id} href={att.file_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-700 dark:text-surface-300 truncate group-hover:text-primary-500 transition-colors">{att.file_name}</p>
                      <p className="text-xs text-surface-400 dark:text-surface-500">{att.file_size ? `${(att.file_size / 1024).toFixed(1)} KB` : 'File'}</p>
                    </div>
                    <svg className="w-4 h-4 text-surface-300 dark:text-surface-600 group-hover:text-primary-500 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 border border-dashed border-surface-200 dark:border-surface-700 rounded-xl">
                <svg className="w-6 h-6 text-surface-300 dark:text-surface-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <p className="text-xs text-surface-400 dark:text-surface-500">No attachments yet</p>
              </div>
            )}
          </div>

          {/* Created by */}
          {task.created_by && (
            <div className="flex items-center gap-2 pt-3 border-t border-surface-100 dark:border-surface-800 text-xs text-surface-400 dark:text-surface-500">
              <Avatar username={task.created_by.username} avatarUrl={task.created_by.avatar_url} size="xs" />
              <span>Created by <span className="font-medium text-surface-600 dark:text-surface-300">{task.created_by.username}</span></span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100 dark:border-surface-800">
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500 font-medium">Delete this task?</span>
                <button onClick={() => deleteMutation.mutate()}
                  className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">Confirm</button>
                <button onClick={() => setConfirmDelete(false)}
                  className="text-xs text-surface-500 dark:text-surface-400 px-3 py-1.5">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleSave} disabled={!hasChanges || updateMutation.isPending}
              className="btn-primary text-sm">
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
