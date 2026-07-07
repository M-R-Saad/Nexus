import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import { markRead, markAllRead as markAllReadApi } from '../api/notifications'

const TYPE_CONFIG = {
  new_applicant: {
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    color: 'text-blue-500 bg-blue-100 dark:bg-blue-500/15',
  },
  application_accepted: {
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/15',
  },
  application_rejected: {
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    color: 'text-red-500 bg-red-100 dark:bg-red-500/15',
  },
  task_assigned: {
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    color: 'text-primary-500 bg-primary-100 dark:bg-primary-500/15',
  },
  deadline_approaching: {
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/15',
  },
  new_message: {
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    color: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-500/15',
  },
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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fadeInUp">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-2">Notifications</h1>
          <p className="text-surface-500 dark:text-surface-400">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="btn-ghost text-sm text-primary-500">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-24 animate-fadeInUp">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-1">No notifications yet</h3>
          <p className="text-sm text-surface-400 dark:text-surface-500">
            You'll get notified about applications, tasks, and messages.
          </p>
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          {notifications.map((n, i) => {
            const config = TYPE_CONFIG[n.notif_type || n.type] || TYPE_CONFIG.task_assigned
            return (
              <div key={n.id}
                onClick={() => handleClick(n)}
                className={`flex items-start gap-4 px-6 py-5 cursor-pointer transition-colors ${
                  i > 0 ? 'border-t border-surface-100 dark:border-surface-800' : ''
                } ${
                  !n.is_read
                    ? 'bg-primary-50/40 dark:bg-primary-500/5 hover:bg-primary-50/80 dark:hover:bg-primary-500/10'
                    : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${
                    !n.is_read
                      ? 'font-semibold text-surface-900 dark:text-surface-100'
                      : 'text-surface-700 dark:text-surface-300'
                  }`}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">{n.body}</p>
                  )}
                  <p className="text-xs text-surface-400 dark:text-surface-500 mt-1.5 font-medium">
                    {n.created_at ? timeAgo(n.created_at) : ''}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-2 animate-glow-pulse" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
