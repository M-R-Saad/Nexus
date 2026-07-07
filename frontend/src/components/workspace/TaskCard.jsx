import { useState } from 'react'
import TaskDetailModal from './TaskDetailModal'
import Avatar from '../ui/Avatar'
import { useParams } from 'react-router-dom'

const PRIORITY_CONFIG = {
  Low: { color: 'bg-surface-100 text-surface-500 dark:bg-surface-700/50 dark:text-surface-400', border: 'border-l-surface-300 dark:border-l-surface-600' },
  Medium: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', border: 'border-l-blue-400' },
  High: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400', border: 'border-l-orange-400' },
  Urgent: { color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400', border: 'border-l-red-500' },
}

export default function TaskCard({ task, provided, isDragging }) {
  const [showDetail, setShowDetail] = useState(false)
  const { projectId } = useParams()
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low

  return (
    <>
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        onClick={() => setShowDetail(true)}
        className={`bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 border-l-[3px] ${priority.border} p-3 cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'shadow-lg shadow-primary-500/10 scale-[1.02] rotate-1'
            : 'hover:shadow-md dark:hover:shadow-black/20 hover:border-surface-300 dark:hover:border-surface-600'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
            {task.priority}
          </span>
          {task.deadline && (
            <span className="text-[10px] text-surface-400 dark:text-surface-500 ml-auto flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <p className="text-sm font-medium text-surface-800 dark:text-surface-200 mb-2 line-clamp-2">{task.title}</p>

        <div className="flex items-center justify-between">
          {task.assigned_to ? (
            <div className="flex items-center gap-1.5">
              <Avatar username={task.assigned_to.username} avatarUrl={task.assigned_to.avatar_url} size="xs" />
              <span className="text-[10px] text-surface-400 dark:text-surface-500 font-medium">{task.assigned_to.username}</span>
            </div>
          ) : (
            <div />
          )}

          {task.attachments?.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-surface-400 dark:text-surface-500 font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {task.attachments.length}
            </div>
          )}
        </div>
      </div>

      {showDetail && (
        <TaskDetailModal task={task} projectId={projectId} onClose={() => setShowDetail(false)} />
      )}
    </>
  )
}