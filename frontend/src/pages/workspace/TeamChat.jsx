import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getMessages } from '../../api/workspace'
import { useAuth } from '../../hooks/useAuth'
import { useWebSocket } from '../../hooks/useWebSocket'
import Avatar from '../../components/ui/Avatar'

function formatTime(iso) {
  const date = new Date(iso)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
      {!isMe && (
        <Avatar username={msg.sender?.username} avatarUrl={msg.sender?.avatar_url} size="sm" />
      )}
      <div className={`max-w-sm ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isMe && (
          <span className="text-[10px] text-surface-400 dark:text-surface-500 mb-1 ml-1 font-medium">{msg.sender?.username}</span>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? 'bg-primary-600 text-white rounded-br-md shadow-sm'
            : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 rounded-bl-md'
        }`}>
          {msg.content}
        </div>
        <span className="text-[10px] text-surface-300 dark:text-surface-600 mt-1 mx-1">
          {msg.created_at ? formatTime(msg.created_at) : ''}
        </span>
      </div>
    </div>
  )
}

export default function TeamChat() {
  const { projectId } = useParams()
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [historyLoading, setHistoryLoading] = useState(true)
  const [showOnline, setShowOnline] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeout = useRef(null)

  const wsUrl = `ws://${window.location.host}/ws/chat/${projectId}/`
  const { messages: wsMessages, send, sendTyping, connected, onlineUsers, typingUsers } = useWebSocket(wsUrl)

  useEffect(() => {
    setHistoryLoading(true)
    getMessages(projectId)
      .then((r) => {
        const data = r.data?.results || r.data || []
        setHistory(data)
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, wsMessages])

  const handleSend = (e) => {
    e.preventDefault()
    const content = input.trim()
    if (!content || !connected) return
    send({ type: 'message', content })
    setInput('')
    sendTyping(false)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    inputRef.current?.focus()
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    sendTyping(true)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      sendTyping(false)
    }, 2000)
  }

  const seenIds = new Set()
  const allMessages = [...history, ...wsMessages].filter((m) => {
    if (!m.id) return true
    if (seenIds.has(m.id)) return false
    seenIds.add(m.id)
    return true
  })

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Team Chat
            </h1>
            <span className={`badge text-[10px] ${connected ? 'badge-success' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-surface-400'}`} />
              {connected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
          <button onClick={() => setShowOnline((s) => !s)}
            className="btn-ghost text-xs gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {onlineUsers.length + (connected ? 1 : 0)} online
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-surface-50 dark:bg-surface-950">
          {historyLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex gap-2.5 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                  <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
                  <div className={`h-10 rounded-2xl skeleton ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
                </div>
              ))}
            </div>
          ) : allMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-surface-600 dark:text-surface-300 font-semibold">No messages yet</p>
              <p className="text-surface-400 dark:text-surface-500 text-sm mt-1">Be the first to say something!</p>
            </div>
          ) : (
            allMessages.map((msg, i) => {
              const isMe = msg.sender?.id === user?.id || msg.sender?.username === user?.username
              return <MessageBubble key={msg.id || i} msg={msg} isMe={isMe} />
            })
          )}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-1.5">
                {typingUsers.slice(0, 3).map((u) => (
                  <div key={u.user_id}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 border-2 border-surface-50 dark:border-surface-950 flex items-center justify-center text-[9px] text-white font-bold">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl rounded-bl-md px-4 py-2.5">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
              <span className="text-[10px] text-surface-400 dark:text-surface-500 font-medium">
                {typingUsers.map((u) => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-5 py-4 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 flex-shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e) }}
                placeholder={connected ? 'Type a message...' : 'Connecting...'}
                disabled={!connected}
                maxLength={2000}
                className="input pr-12"
              />
              {input.length > 1800 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-surface-400 font-medium">{2000 - input.length}</span>
              )}
            </div>
            <button type="submit" disabled={!connected || !input.trim()}
              className="btn-primary px-5 py-2.5 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Online users panel */}
      {showOnline && (
        <div className="w-60 border-l border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex-shrink-0 animate-fadeIn">
          <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-800">
            <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-surface-400 dark:text-surface-500">Online Now</p>
          </div>
          <div className="p-3 space-y-1">
            {/* Current user */}
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
              <div className="relative">
                <Avatar username={user?.username} avatarUrl={user?.avatar_url} size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-surface-900" />
              </div>
              <span className="text-sm text-surface-700 dark:text-surface-300 font-medium truncate">{user?.username}</span>
              <span className="text-[10px] text-surface-400 dark:text-surface-500 ml-auto font-medium">you</span>
            </div>

            {onlineUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                <div className="relative">
                  <Avatar username={u.username} avatarUrl={u.avatar_url} size="sm" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-surface-900" />
                </div>
                <span className="text-sm text-surface-700 dark:text-surface-300 truncate">{u.username}</span>
              </div>
            ))}

            {onlineUsers.length === 0 && (
              <p className="text-xs text-surface-400 dark:text-surface-500 px-2 py-3 text-center">No other members online</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
