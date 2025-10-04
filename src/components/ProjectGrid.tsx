import ProjectCard from './ProjectCard'
import { projects } from '@/data/projects'

export default function ProjectGrid() {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">
          Featured Projects
        </h2>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          A collection of projects showcasing modern web development and innovative solutions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}