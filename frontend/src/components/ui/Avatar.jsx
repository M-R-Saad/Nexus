export default function Avatar({ username, avatarUrl, size = 'md' }) {
  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-12 h-12 text-lg' }
  if (avatarUrl) {
    return <img src={avatarUrl} alt={username} className={`${sizes[size]} rounded-full object-cover`} />
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold`}>
      {username?.[0]?.toUpperCase() || '?'}
    </div>
  )
}
