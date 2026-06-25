import { useParams } from 'react-router-dom'
import ActivityFeed from '../../components/workspace/ActivityFeed'

export default function ActivityPage() {
  const { projectId } = useParams()

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-surface-900 mb-6">Activity Feed</h1>
      <div className="bg-white rounded-xl border border-surface-200">
        <ActivityFeed projectId={projectId} />
      </div>
    </div>
  )
}
