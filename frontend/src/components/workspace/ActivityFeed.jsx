import { useQuery } from '@tanstack/react-query'
import { getActivity } from '../../api/workspace'

export default function ActivityFeed({ projectId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: () => getActivity(projectId).then((r) => r.data),
  })

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
      </div>
    )
  }

  const items = data?.results || data || []

  return (
    <div className="p-4 max-h-96 overflow-y-auto">
      {items.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-6 h-6 text-surface-300 dark:text-surface-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p className="text-xs text-surface-400 dark:text-surface-500">No activity yet.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-surface-200 dark:bg-surface-700" />

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 relative">
                <div className="w-[11px] h-[11px] rounded-full bg-primary-500 border-2 border-white dark:border-surface-900 flex-shrink-0 mt-1 z-10" />
                <div className="min-w-0">
                  <p className="text-sm text-surface-700 dark:text-surface-300 leading-snug">{item.description}</p>
                  <p className="text-[10px] text-surface-400 dark:text-surface-500 mt-0.5 font-medium">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
