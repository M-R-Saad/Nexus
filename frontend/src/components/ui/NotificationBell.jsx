import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { markRead, markAllRead as markAllReadApi } from '../../api/notifications'

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

export default function NotificationBell() {
  const { notifications, unreadCount, markOneRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const panelRef = useRef()

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = async (notif) => {
    if (!notif.is_read) {
      await markRead(notif.id)
      markOneRead(notif.id)
    }
    setOpen(false)
    if (notif.link) navigate(notif.link)
  }

  const handleMarkAll = async () => {
    await markAllReadApi()
    markAllRead()
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-surface-800 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-surface-200 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-surface-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-surface-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-3xl mb-2">🔔</span>
                <p className="text-sm font-medium text-surface-600">All caught up!</p>
                <p className="text-xs text-surface-400 mt-1">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-surface-50 transition-colors ${
                    !n.is_read ? 'bg-primary-50/60' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base ${
                    !n.is_read ? 'bg-primary-100' : 'bg-surface-100'
                  }`}>
                    {TYPE_ICONS[n.notif_type || n.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.is_read ? 'font-medium text-red-500' : 'text-black'}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-black mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-xs text-black mt-1">
                      {n.created_at ? timeAgo(n.created_at) : ''}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-surface-100 px-5 py-3 text-center">
              <button
                onClick={() => { navigate('/notifications'); setOpen(false) }}
                className="text-xs text-primary-600 hover:underline"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
