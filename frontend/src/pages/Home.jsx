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
    <main className="relative overflow-hidden">
      {/* ── Hero Section ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/20 dark:bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-20 -right-32 w-80 h-80 bg-accent-500/20 dark:bg-accent-500/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-primary-600/15 dark:bg-primary-600/5 rounded-full blur-3xl animate-float-slower" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-primary-100/80 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-sm font-medium px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm border border-primary-200/50 dark:border-primary-500/20">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-glow-pulse" />
              Open-source collaboration platform
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fadeInUp stagger-1">
            <span className="text-surface-900 dark:text-white">Find your </span>
            <span className="gradient-text-hero">next team</span>
          </h1>

          <p className="text-lg sm:text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp stagger-2">
            Nexus connects developers who want to build together.
            Post your idea, find collaborators, and ship real projects — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeInUp stagger-3">
            <Link to="/discover"
              className="btn-gradient px-8 py-3.5 text-base rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore Projects
            </Link>
            <Link to="/projects/create"
              className="btn-secondary px-8 py-3.5 text-base rounded-2xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post a Project
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 sm:gap-16 mt-16 animate-fadeInUp stagger-4">
            {[
              { value: '100+', label: 'Projects' },
              { value: '500+', label: 'Developers' },
              { value: '1K+', label: 'Collaborations' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Section ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
              Trending this week
            </h2>
            <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
              Most active projects in the community
            </p>
          </div>
          <Link to="/discover" className="btn-ghost text-sm text-primary-600 dark:text-primary-400">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-56 rounded-2xl" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} className={`stagger-${Math.min(i + 1, 6)}`} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-1">No projects yet</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">Be the first to post a project!</p>
            <Link to="/projects/create" className="btn-primary">Create a project</Link>
          </div>
        )}
      </section>
    </main>
  )
}
