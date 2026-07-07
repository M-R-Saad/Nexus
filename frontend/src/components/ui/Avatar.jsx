const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

export default function Avatar({ username, avatarUrl, size = 'md', className = '' }) {
  const sizeClass = SIZES[size] || SIZES.md
  const initial = (username || '?')[0].toUpperCase()

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-surface-200 dark:ring-surface-700 ${className}`}
      />
    )
  }

  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-semibold
      bg-gradient-to-br from-primary-500 to-accent-500 text-white
      ring-2 ring-surface-200 dark:ring-surface-700
      ${className}`}>
      {initial}
    </div>
  )
}
