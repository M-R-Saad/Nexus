import { useEffect, useRef, useState, useCallback } from 'react'

export function useWebSocket(url) {
  const wsRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const reconnectTimer = useRef(null)
  const shouldReconnect = useRef(true)

  const buildUrl = useCallback(() => {
    if (!url) return null
    const token = localStorage.getItem('access_token')
    if (!token) return null
    return `${url}?token=${token}`
  }, [url])

  const connect = useCallback(() => {
    const fullUrl = buildUrl()
    if (!fullUrl) return

    const ws = new WebSocket(fullUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      // clear any reconnect timer
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
        reconnectTimer.current = null
      }
    }

    ws.onclose = (e) => {
      setConnected(false)
      // code 4001 = unauthenticated, 4003 = not a member — don't reconnect
      if (shouldReconnect.current && e.code !== 4001 && e.code !== 4003) {
        reconnectTimer.current = setTimeout(connect, 3000)
      }
    }

    ws.onerror = () => {
      ws.close()
    }

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        const type = data.type

        if (type === 'message') {
          setMessages((prev) => [...prev, data])
        } else if (type === 'presence') {
          if (data.event === 'join') {
            setOnlineUsers((prev) => {
              if (prev.find((u) => u.id === data.user.id)) return prev
              return [...prev, data.user]
            })
          } else if (data.event === 'leave') {
            setOnlineUsers((prev) => prev.filter((u) => u.id !== data.user.id))
          }
        } else if (type === 'typing') {
          if (data.is_typing) {
            setTypingUsers((prev) => {
              if (prev.find((u) => u.user_id === data.user_id)) return prev
              return [...prev, { user_id: data.user_id, username: data.username }]
            })
            // auto-clear after 3 seconds
            setTimeout(() => {
              setTypingUsers((prev) => prev.filter((u) => u.user_id !== data.user_id))
            }, 3000)
          } else {
            setTypingUsers((prev) => prev.filter((u) => u.user_id !== data.user_id))
          }
        }
      } catch {
        // ignore malformed messages
      }
    }
  }, [buildUrl])

  useEffect(() => {
    if (!url) return
    shouldReconnect.current = true
    connect()

    return () => {
      shouldReconnect.current = false
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      if (wsRef.current) wsRef.current.close()
      setMessages([])
      setOnlineUsers([])
      setTypingUsers([])
    }
  }, [url, connect])

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  const sendTyping = useCallback((isTyping) => {
    send({ type: 'typing', is_typing: isTyping })
  }, [send])

  return { messages, send, sendTyping, connected, onlineUsers, typingUsers }
}
