import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProjects } from '../api/projects'
import ProjectCard from '../components/projects/ProjectCard'
import ProjectFilters from '../components/projects/ProjectFilters'

export default function Discover() {
  const [filters, setFilters] = useState({})

  // Remove empty strings before sending to API
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  )

  const { data, isLoading } = useQuery({
    queryKey: ['projects', cleanFilters],
    queryFn: () => getProjects(cleanFilters).then((r) => r.data),
  })

  const projects = data?.results || data || []

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 mb-2">Discover Projects</h1>
        <p className="text-surface-500">Find a project that matches your skills.</p>
      </div>

      <div className="mb-6">
        <ProjectFilters filters={filters} onChange={setFilters} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-surface-100 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-surface-400 text-lg">No projects found.</p>
          <p className="text-surface-300 text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </main>
  )
}
