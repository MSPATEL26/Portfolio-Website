'use client'

import dynamic from 'next/dynamic'
import ProjectCard from '@/components/ProjectCard'
import { PROJECTS } from '@/lib/constants'

const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false })

export default function ProjectsPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <ParticleField />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#00d9ff] text-sm font-semibold tracking-widest mb-3">PORTFOLIO</p>
          <h1 className="text-5xl md:text-6xl font-black text-white">Selected Works</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  )
}
