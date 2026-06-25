import { createContext, useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getNotifications } from '../api/notifications'

export const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    // Load existing notifications
    getNotifications()
      .then((res) => {
        const data = res.data?.results || res.data || []
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.is_read).length)
      })
      .catch(() => {})

    // Connect to notification WebSocket with JWT token
    const connect = () => {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const ws = new WebSocket(`ws://${window.location.host}/ws/notifications/?token=${token}`)
      wsRef.current = ws

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'notification') {
            setNotifications((prev) => {
              if (prev.some((n) => n.id === data.id)) return prev
              setUnreadCount((c) => c + 1)
              return [data, ...prev]
            })
          }
        } catch {}
      }

      ws.onclose = (e) => {
        // Don't reconnect if closed due to auth failure
        if (e.code !== 4001) {
          reconnectTimer.current = setTimeout(connect, 5000)
        }
      }
    }

    connect()

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [user])

  const markOneRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markOneRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}
