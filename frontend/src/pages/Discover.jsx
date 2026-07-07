import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProjects } from '../api/projects'
import ProjectCard from '../components/projects/ProjectCard'
import ProjectFilters from '../components/projects/ProjectFilters'

export default function Discover() {
  const [filters, setFilters] = useState({})

  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  )

  const { data, isLoading } = useQuery({
    queryKey: ['projects', cleanFilters],
    queryFn: () => getProjects(cleanFilters).then((r) => r.data),
  })

  const projects = data?.results || data || []

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 animate-fadeInUp">
        <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-2">
          Discover Projects
        </h1>
        <p className="text-surface-500 dark:text-surface-400">
          Find a project that matches your skills and interests.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 animate-fadeInUp stagger-1">
        <ProjectFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="skeleton h-56 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 animate-fadeInUp">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-1">No projects found</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} className={`stagger-${Math.min(i + 1, 6)}`} />
          ))}
        </div>
      )}
    </main>
  )
}
