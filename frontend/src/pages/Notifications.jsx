import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import { markRead, markAllRead as markAllReadApi } from '../api/notifications'

const TYPE_ICONS = {
  new_applicant: '👋',
  application_accepted: '🎉',
  application_rejected: '😔',
  task_assigned: '📋',
  deadline_approaching: '⏰',
  new_message: '💬',
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Notifications() {
  const { notifications, unreadCount, markOneRead, markAllRead } = useNotifications()
  const navigate = useNavigate()

  const handleClick = async (notif) => {
    if (!notif.is_read) {
      try { await markRead(notif.id) } catch {}
      markOneRead(notif.id)
    }
    if (notif.link) navigate(notif.link)
  }

  const handleMarkAll = async () => {
    try { await markAllReadApi() } catch {}
    markAllRead()
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Notifications</h1>
          <p className="text-surface-500">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You\'re all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔔</span>
          </div>
          <p className="text-surface-400 text-lg mb-1">No notifications yet</p>
          <p className="text-surface-300 text-sm">
            You'll get notified about applications, task assignments, and more.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden divide-y divide-surface-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex items-start gap-4 px-6 py-5 cursor-pointer hover:bg-surface-50 transition-colors ${
                !n.is_read ? 'bg-primary-50/50' : ''
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                !n.is_read ? 'bg-primary-100' : 'bg-surface-100'
              }`}>
                {TYPE_ICONS[n.notif_type || n.type] || '🔔'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-surface-900' : 'text-surface-700'}`}>
                  {n.title}
                </p>
                {n.body && (
                  <p className="text-sm text-surface-500 mt-1 line-clamp-2">{n.body}</p>
                )}
                <p className="text-xs text-surface-400 mt-1.5">
                  {n.created_at ? timeAgo(n.created_at) : ''}
                </p>
              </div>

              {/* Unread dot */}
              {!n.is_read && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
