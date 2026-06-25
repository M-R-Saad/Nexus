import { useState, useEffect, useRef, useCallback } from 'react'
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
    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
      {!isMe && (
        <Avatar username={msg.sender?.username} avatarUrl={msg.sender?.avatar_url} size="sm" />
      )}
      <div className={`max-w-sm ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isMe && (
          <span className="text-xs text-surface-400 mb-1 ml-1">{msg.sender?.username}</span>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? 'bg-primary-600 text-white rounded-br-sm'
            : 'bg-white border border-surface-200 text-surface-900 rounded-bl-sm'
        }`}>
          {msg.content}
        </div>
        <span className="text-xs text-surface-300 mt-1 mx-1">
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

  // Load message history on mount
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

  // Auto scroll to bottom on new messages
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

    // Send typing indicator
    sendTyping(true)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      sendTyping(false)
    }, 2000)
  }

  // Combine history + live messages, deduplicate by id
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
        <div className="px-5 py-3 border-b border-surface-200 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-surface-900">Team Chat</h1>
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
              connected ? 'bg-green-100 text-green-600' : 'bg-surface-100 text-surface-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-surface-400'}`} />
              {connected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
          <button
            onClick={() => setShowOnline((s) => !s)}
            className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-700 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-green-400" />
            {onlineUsers.length + (connected ? 1 : 0)} online
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-surface-50">
          {historyLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                  <div className="w-7 h-7 rounded-full bg-surface-200 animate-pulse flex-shrink-0" />
                  <div className={`h-10 rounded-2xl bg-surface-200 animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
                </div>
              ))}
            </div>
          ) : allMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-surface-500 font-medium">No messages yet</p>
              <p className="text-surface-400 text-sm mt-1">Be the first to say something!</p>
            </div>
          ) : (
            allMessages.map((msg, i) => {
              const isMe = msg.sender?.id === user?.id || msg.sender?.username === user?.username
              return <MessageBubble key={msg.id || i} msg={msg} isMe={isMe} />
            })
          )}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {typingUsers.slice(0, 3).map((u) => (
                  <div key={u.user_id}
                    className="w-6 h-6 rounded-full bg-surface-300 border-2 border-surface-50 flex items-center justify-center text-xs text-surface-600">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                ))}
              </div>
              <div className="bg-white border border-surface-200 rounded-2xl rounded-bl-sm px-4 py-2.5">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
              <span className="text-xs text-surface-400">
                {typingUsers.map((u) => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-5 py-4 bg-white border-t border-surface-200 flex-shrink-0">
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
                className="w-full border border-surface-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-surface-50 disabled:text-surface-400 resize-none"
              />
              {input.length > 1800 && (
                <span className="absolute right-3 bottom-3 text-xs text-surface-400">{2000 - input.length}</span>
              )}
            </div>
            <button
              type="submit"
              disabled={!connected || !input.trim()}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Online users panel */}
      {showOnline && (
        <div className="w-56 border-l border-surface-200 bg-white flex-shrink-0">
          <div className="px-4 py-3 border-b border-surface-100">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Online Now</p>
          </div>
          <div className="p-3 space-y-2">
            {/* Current user */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
              <div className="relative">
                <Avatar username={user?.username} avatarUrl={user?.avatar_url} size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <span className="text-sm text-surface-700 font-medium truncate">{user?.username}</span>
              <span className="text-xs text-surface-400 ml-auto">you</span>
            </div>

            {onlineUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                <div className="relative">
                  <Avatar username={u.username} avatarUrl={u.avatar_url} size="sm" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <span className="text-sm text-surface-700 truncate">{u.username}</span>
              </div>
            ))}

            {onlineUsers.length === 0 && (
              <p className="text-xs text-surface-400 px-2 py-1">No other members online</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
