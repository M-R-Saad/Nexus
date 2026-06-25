import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { getTasks, updateTask, createTask } from '../../api/workspace'
import TaskCard from '../../components/workspace/TaskCard'
import ActivityFeed from '../../components/workspace/ActivityFeed'

const COLUMNS = ['Todo', 'In Progress', 'Review', 'Done']

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

  if (isLoading) return <div className="p-8"><div className="bg-surface-100 rounded-xl h-64 animate-pulse" /></div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-surface-900">Kanban Board</h1>
        <button onClick={() => setShowActivity((s) => !s)}
          className="text-sm text-primary-600 hover:underline">
          {showActivity ? 'Hide Activity' : 'Show Activity'}
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col)
            return (
              <div key={col} className="flex-shrink-0 w-64 bg-surface-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-surface-700">{col}</h3>
                  <span className="text-xs text-surface-400 bg-surface-200 rounded-full w-5 h-5 flex items-center justify-center">
                    {colTasks.length}
                  </span>
                </div>

                <Droppable droppableId={col}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-16">
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => <TaskCard task={task} provided={provided} />}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {addingTo === col ? (
                  <div className="mt-2">
                    <input autoFocus value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task title..." onKeyDown={(e) => { if (e.key === 'Enter') createMutation.mutate(newTaskTitle); if (e.key === 'Escape') setAddingTo(null) }}
                      className="w-full text-sm border border-primary-400 rounded-lg px-3 py-2 outline-none" />
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => createMutation.mutate(newTaskTitle)} className="text-xs bg-primary-600 text-white px-3 py-1 rounded-lg">Add</button>
                      <button onClick={() => setAddingTo(null)} className="text-xs text-surface-500 px-3 py-1">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingTo(col)} className="mt-2 w-full text-left text-xs text-surface-400 hover:text-surface-600 py-1 px-2 hover:bg-surface-200 rounded-lg transition-colors">
                    + Add task
                  </button>
                )}
              </div>
            )
          })}
        </DragDropContext>

        {showActivity && (
          <div className="flex-shrink-0 w-72 bg-white rounded-xl border border-surface-200">
            <h3 className="text-sm font-medium text-surface-700 p-4 border-b border-surface-100">Activity Feed</h3>
            <ActivityFeed projectId={projectId} />
          </div>
        )}
      </div>
    </div>
  )
}
