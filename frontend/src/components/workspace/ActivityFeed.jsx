import { useQuery } from '@tanstack/react-query'
import { getActivity } from '../../api/workspace'

export default function ActivityFeed({ projectId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: () => getActivity(projectId).then((r) => r.data),
  })

  if (isLoading) return <p className="text-sm text-surface-400 p-4">Loading activity...</p>

  const items = data?.results || data || []

  return (
    <div className="space-y-3 p-4">
      {items.length === 0 && <p className="text-sm text-surface-400">No activity yet.</p>}
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-surface-700">{item.description}</p>
            <p className="text-xs text-surface-400">{new Date(item.created_at).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
