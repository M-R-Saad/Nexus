export default function ProjectFilters({ filters, onChange }) {
  const statuses = ['Recruiting', 'In Progress', 'Completed']
  const difficulties = ['Beginner', 'Intermediate', 'Advanced']
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search projects..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="input pl-10"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status || ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="input w-auto min-w-[140px]"
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Difficulty */}
      <select
        value={filters.difficulty || ''}
        onChange={(e) => onChange({ ...filters, difficulty: e.target.value })}
        className="input w-auto min-w-[160px]"
      >
        <option value="">All Difficulties</option>
        {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* Role */}
      <input
        type="text"
        placeholder="Filter by role..."
        value={filters.role || ''}
        onChange={(e) => onChange({ ...filters, role: e.target.value })}
        className="input w-auto min-w-[150px]"
      />

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => onChange({})}
          className="btn-ghost text-xs gap-1 text-surface-400 hover:text-red-500 dark:hover:text-red-400"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  )
}
