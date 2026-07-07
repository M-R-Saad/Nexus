import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { getTasks, updateTask, createTask } from '../../api/workspace'
import TaskCard from '../../components/workspace/TaskCard'
import ActivityFeed from '../../components/workspace/ActivityFeed'

const COLUMNS = [
  { id: 'Todo', color: 'bg-surface-400', accent: 'border-surface-300 dark:border-surface-600' },
  { id: 'In Progress', color: 'bg-blue-500', accent: 'border-blue-400 dark:border-blue-600' },
  { id: 'Review', color: 'bg-amber-500', accent: 'border-amber-400 dark:border-amber-600' },
  { id: 'Done', color: 'bg-emerald-500', accent: 'border-emerald-400 dark:border-emerald-600' },
]

export default function KanbanBoard() {
  const { projectId } = useParams()
  const queryClient = useQueryClient()
  const [showActivity, setShowActivity] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTo, setAddingTo] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasks(projectId).then((r) => r.data),
  })

  const moveMutation = useMutation({
    mutationFn: ({ taskId, status }) => updateTask(taskId, { status }),
    onSuccess: () => queryClient.invalidateQueries(['tasks', projectId]),
  })

  const createMutation = useMutation({
    mutationFn: (title) => createTask(projectId, { title, status: addingTo }),
    onSuccess: () => { queryClient.invalidateQueries(['tasks', projectId]); setNewTaskTitle(''); setAddingTo(null) },
  })

  const tasks = data?.results || data || []

  const onDragEnd = (result) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    moveMutation.mutate({ taskId: draggableId, status: destination.droppableId })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-40 rounded-lg mb-6" />
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 w-64 rounded-2xl flex-shrink-0" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 animate-fadeInUp">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-surface-900 dark:text-white">Kanban Board</h1>
        <button onClick={() => setShowActivity((s) => !s)}
          className="btn-ghost text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          {showActivity ? 'Hide Activity' : 'Activity'}
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <DragDropContext onDragEnd={onDragEnd}>
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id)
            return (
              <div key={col.id} className={`flex-shrink-0 w-72 bg-surface-100 dark:bg-surface-900/50 rounded-2xl p-3 border-t-2 ${col.accent}`}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color}`} />
                    <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">{col.id}</h3>
                  </div>
                  <span className="text-[10px] font-bold text-surface-400 dark:text-surface-500 bg-surface-200 dark:bg-surface-800 rounded-full w-5 h-5 flex items-center justify-center">
                    {colTasks.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className={`space-y-2 min-h-[64px] rounded-xl transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary-100/30 dark:bg-primary-500/5' : ''
                      }`}>
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => <TaskCard task={task} provided={provided} isDragging={snapshot.isDragging} />}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {addingTo === col.id ? (
                  <div className="mt-2">
                    <input autoFocus value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task title..."
                      onKeyDown={(e) => { if (e.key === 'Enter' && newTaskTitle.trim()) createMutation.mutate(newTaskTitle); if (e.key === 'Escape') setAddingTo(null) }}
                      className="input text-sm" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => newTaskTitle.trim() && createMutation.mutate(newTaskTitle)}
                        className="btn-primary text-xs px-3 py-1.5">Add</button>
                      <button onClick={() => setAddingTo(null)}
                        className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingTo(col.id)}
                    className="mt-2 w-full text-left text-xs text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 py-2 px-3 hover:bg-surface-200/50 dark:hover:bg-surface-800/50 rounded-xl transition-colors flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add task
                  </button>
                )}
              </div>
            )
          })}
        </DragDropContext>

        {showActivity && (
          <div className="flex-shrink-0 w-80 card rounded-2xl overflow-hidden animate-fadeIn">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white p-4 border-b border-surface-100 dark:border-surface-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Activity Feed
            </h3>
            <ActivityFeed projectId={projectId} />
          </div>
        )}
      </div>
    </div>
  )
}
