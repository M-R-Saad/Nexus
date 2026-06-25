export default function SkillTag({ name, category }) {
  const colors = {
    Frontend: 'bg-blue-100 text-blue-700',
    Backend: 'bg-green-100 text-green-700',
    DevOps: 'bg-orange-100 text-orange-700',
    Design: 'bg-pink-100 text-pink-700',
    Mobile: 'bg-purple-100 text-purple-700',
    Data: 'bg-yellow-100 text-yellow-700',
    Other: 'bg-surface-100 text-surface-600',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[category] || colors.Other}`}>
      {name}
    </span>
  )
}
