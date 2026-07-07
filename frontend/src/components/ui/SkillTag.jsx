const CATEGORY_COLORS = {
  Frontend: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  Backend:  'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  DevOps:   'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
  Design:   'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400',
  Mobile:   'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  Data:     'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',
  Other:    'bg-surface-100 text-surface-600 dark:bg-surface-700/50 dark:text-surface-300',
}

export default function SkillTag({ name, category, className = '' }) {
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${colorClass} ${className}`}>
      {name}
    </span>
  )
}
