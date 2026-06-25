export default function ProjectFilters({ filters, onChange }) {
  const statuses = ['Recruiting', 'In Progress', 'Completed']
  const difficulties = ['Beginner', 'Intermediate', 'Advanced']

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Search projects..."
        value={filters.search || ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="text-sm border border-surface-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 outline-none min-w-48"
      />
      <select
        value={filters.status || ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="text-sm border border-surface-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        value={filters.difficulty || ''}
        onChange={(e) => onChange({ ...filters, difficulty: e.target.value })}
        className="text-sm border border-surface-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
      >
        <option value="">All Difficulties</option>
        {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <input
        type="text"
        placeholder="Filter by role..."
        value={filters.role || ''}
        onChange={(e) => onChange({ ...filters, role: e.target.value })}
        className="text-sm border border-surface-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
      />
      {Object.values(filters).some(Boolean) && (
        <button
          onClick={() => onChange({})}
          className="text-sm text-surface-400 hover:text-surface-600 px-2 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
