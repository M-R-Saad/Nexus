import { useParams } from 'react-router-dom'
import ActivityFeed from '../../components/workspace/ActivityFeed'

export default function ActivityPage() {
  const { projectId } = useParams()

  return (
    <div className="p-6 max-w-3xl animate-fadeInUp">
      <h1 className="text-xl font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Activity Feed
      </h1>
      <div className="card rounded-2xl overflow-hidden">
        <ActivityFeed projectId={projectId} />
      </div>
    </div>
  )
}
