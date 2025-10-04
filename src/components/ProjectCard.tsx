'use client'

import Image from 'next/image'
import { Project } from '@/data/projects'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:scale-105 transition-transform duration-300">
      {/* Project Image */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Base gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

        {/* Hover Overlay with Description */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
          <p className="text-white text-center text-sm leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="relative z-10 p-6">
        <h3 className="text-xl font-semibold text-white mb-3">
          {project.title}
        </h3>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-indigo-600/20 text-indigo-400 text-xs font-medium rounded-full border border-indigo-400/30"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}