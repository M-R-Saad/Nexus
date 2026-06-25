import { useState } from 'react'
import TaskDetailModal from './TaskDetailModal'
import Avatar from '../ui/Avatar'
import { useParams } from 'react-router-dom'

const priorityColors = {
  Low: 'bg-surface-100 text-surface-500',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
}

export default function TaskCard({ task, provided }) {
  const [showDetail, setShowDetail] = useState(false)
  const { projectId } = useParams()

  return (
    <>
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        onClick={() => setShowDetail(true)}
        className="bg-white rounded-lg border border-surface-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.deadline && (
            <span className="text-[10px] text-surface-400 ml-auto">
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <p className="text-sm font-medium text-surface-800 mb-2 line-clamp-2">{task.title}</p>

        {task.assigned_to && (
          <div className="flex items-center gap-1.5 mt-auto">
            <Avatar username={task.assigned_to.username} avatarUrl={task.assigned_to.avatar_url} size="xs" />
            <span className="text-xs text-surface-400">{task.assigned_to.username}</span>
          </div>
        )}

        {task.attachments?.length > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-surface-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {task.attachments.length}
          </div>
        )}
      </div>

      {showDetail && (
        <TaskDetailModal
          task={task}
          projectId={projectId}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  )
}