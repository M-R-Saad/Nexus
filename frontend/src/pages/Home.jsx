import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getTrendingProjects } from '../api/projects'
import ProjectCard from '../components/projects/ProjectCard'

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => getTrendingProjects().then((r) => r.data),
  })

  const projects = data?.results || data || []

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-surface-900 mb-4">Find your next team</h1>
        <p className="text-xl text-surface-500 mb-8">
          Nexus connects developers who want to build together. Post your idea or join a project.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/discover" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Explore Projects
          </Link>
          <Link to="/projects/create" className="border border-surface-200 hover:border-primary-500 text-surface-900 px-6 py-3 rounded-xl font-medium transition-colors">
            Post a Project
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-surface-900 mb-6">Trending this week</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface-100 rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </main>
  )
}
