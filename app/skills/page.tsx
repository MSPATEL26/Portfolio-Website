'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false })
const Globe3D       = dynamic(() => import('@/components/Globe3D'),       { ssr: false })

// ── Skill data ───────────────────────────────────────────────────────────────
const CYAN = '#00d9ff'

const SKILL_CATEGORIES = [
  {
    id: 'foundations',
    label: 'Foundations',
    title: 'Programming Foundations',
    description: 'Core concepts that underpin everything — applied across problem-solving, development, and system design.',
    skills: [
      { name: 'Object-Oriented Programming' },
      { name: 'Data Structures & Algorithms' },
      { name: 'Complexity Analysis' },
      { name: 'Computer Networks' },
      { name: 'Operating Systems' },
      { name: 'Database Management Systems' },
      { name: 'Software Engineering' },
      { name: 'System Design' },
    ],
  },
  {
    id: 'languages',
    label: 'Languages',
    title: 'Languages & Frameworks',
    description: 'Languages and frameworks used across data work, backend logic, and frontend interfaces.',
    skills: [
      { name: 'JavaScript',  icon: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
      { name: 'TypeScript',  icon: 'https://cdn.simpleicons.org/typescript/3178C6' },
      { name: 'Python',      icon: 'https://cdn.simpleicons.org/python/3776AB' },
      { name: 'C++',         icon: 'https://cdn.simpleicons.org/cplusplus/00599C' },
      { name: 'SQL',         icon: 'https://cdn.simpleicons.org/mysql/4479A1' },
      { name: 'React',       icon: 'https://cdn.simpleicons.org/react/61DAFB' },
      { name: 'Next.js',     icon: 'https://cdn.simpleicons.org/nextdotjs/ffffff' },
      { name: 'Node.js',     icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
      { name: 'Express.js',  icon: 'https://cdn.simpleicons.org/express/ffffff' },
      { name: 'Tailwind CSS', icon: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
      { name: 'PostgreSQL',  icon: 'https://cdn.simpleicons.org/postgresql/4169E1' },
      { name: 'MongoDB',     icon: 'https://cdn.simpleicons.org/mongodb/47A248' },
      { name: 'HTML / CSS',  icon: 'https://cdn.simpleicons.org/html5/E34F26' },
      { name: 'Flask',       icon: 'https://cdn.simpleicons.org/flask/ffffff' },
    ],
  },
  {
    id: 'aiml',
    label: 'AI / ML',
    title: 'AI & Machine Learning',
    description: 'Concepts explored through coursework and applied directly to analytical and agentic projects.',
    skills: [
      { name: 'Supervised Learning' },
      { name: 'Unsupervised Learning' },
      { name: 'Deep Learning' },
      { name: 'Neural Networks' },
      { name: 'NLP' },
      { name: 'Feature Engineering' },
      { name: 'Model Evaluation' },
      { name: 'PyTorch',      icon: 'https://cdn.simpleicons.org/pytorch/EE4C2C' },
      { name: 'LangChain',    icon: 'https://cdn.simpleicons.org/langchain/00d9ff' },
      { name: 'RAG' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    title: 'Tools & Ecosystem',
    description: 'Supporting toolchain for data science, visualization, and development.',
    skills: [
      { name: 'NumPy',        icon: 'https://cdn.simpleicons.org/numpy/4DABCF' },
      { name: 'Pandas',       icon: 'https://cdn.simpleicons.org/pandas/white' },
      { name: 'Scikit-Learn', icon: 'https://cdn.simpleicons.org/scikitlearn/F7931E' },
      { name: 'TensorFlow',   icon: 'https://cdn.simpleicons.org/tensorflow/FF6F00' },
      { name: 'Matplotlib' },
      { name: 'Git & GitHub', icon: 'https://cdn.simpleicons.org/git/F05032' },
      { name: 'Docker',       icon: 'https://cdn.simpleicons.org/docker/2496ED' },
      { name: 'Supabase',     icon: 'https://cdn.simpleicons.org/supabase/3ECF8E' },
      { name: 'Vercel',       icon: 'https://cdn.simpleicons.org/vercel/ffffff' },
      { name: 'Postman',      icon: 'https://cdn.simpleicons.org/postman/FF6C37' },
      { name: 'Jupyter',      icon: 'https://cdn.simpleicons.org/jupyter/F37626' },
      { name: 'VS Code',      icon: 'https://cdn.simpleicons.org/visualstudiocode/007ACC' },
    ],
  },
  {
    id: 'devops',
    label: 'DevOps',
    title: 'DevOps & Cloud',
    description: 'Cloud platforms, containerization, orchestration, and continuous integration pipelines.',
    skills: [
      { name: 'AWS (SAA Certified)', icon: 'https://cdn.simpleicons.org/amazonwebservices/FF9900' },
      { name: 'Oracle Cloud (OCI)', icon: 'https://cdn.simpleicons.org/oracle/F80000' },
      { name: 'Google Cloud Platform', icon: 'https://cdn.simpleicons.org/googlecloud/4285F4' },
      { name: 'Docker',       icon: 'https://cdn.simpleicons.org/docker/2496ED' },
      { name: 'GitHub Actions', icon: 'https://cdn.simpleicons.org/githubactions/2088FF' },
      { name: 'CI/CD Pipelines' },
      { name: 'Vercel',       icon: 'https://cdn.simpleicons.org/vercel/ffffff' },
      { name: 'Render',       icon: 'https://cdn.simpleicons.org/render/ffffff' },
      { name: 'Linux',        icon: 'https://cdn.simpleicons.org/linux/FCC624' },
      { name: 'Nginx',        icon: 'https://cdn.simpleicons.org/nginx/009639' },
    ],
  },
]

// ── Skill tag — minimal outline, cyan on hover ───────────────────────────────
function SkillTag({ skill }: { skill: { name: string; icon?: string } }) {
  return (
    <div className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-transparent hover:border-[#00d9ff]/60 hover:bg-[#00d9ff]/[0.05] hover:shadow-[0_0_12px_rgba(0,217,255,0.12)] transition-all duration-200 cursor-default">
      {skill.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={skill.icon}
          alt={skill.name}
          width={14}
          height={14}
          className="w-3.5 h-3.5 object-contain flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-[#00d9ff] flex-shrink-0 transition-colors" />
      )}
      <span className="text-xs font-mono text-white/55 group-hover:text-[#00d9ff] transition-colors whitespace-nowrap">
        {skill.name}
      </span>
    </div>
  )
}

// ── Category panel — glassmorphism + cyan glow border ────────────────────────
function SkillPanel({
  category,
  isActive,
}: {
  category: typeof SKILL_CATEGORIES[0]
  isActive: boolean
}) {
  if (!isActive) return null

  return (
    <div
      className="rounded-2xl border transition-all duration-300 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'rgba(0,217,255,0.20)',
        boxShadow: '0 0 0 1px rgba(0,217,255,0.06), 0 8px 40px rgba(0,217,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(0,217,255,0.08)' }}
      >
        <div className="flex items-center gap-3">
          {/* Glowing cyan dot */}
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              background: CYAN,
              boxShadow: `0 0 6px ${CYAN}, 0 0 12px ${CYAN}55`,
            }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white tracking-tight">{category.title}</h2>
            <p className="text-white/35 text-[11px] font-mono leading-relaxed mt-0.5">
              {category.description}
            </p>
          </div>
          {/* Skills count badge */}
          <span
            className="text-[10px] font-mono px-2.5 py-1 rounded-full flex-shrink-0 border"
            style={{
              color: CYAN,
              borderColor: 'rgba(0,217,255,0.25)',
              background: 'rgba(0,217,255,0.07)',
            }}
          >
            {category.skills.length} skills
          </span>
        </div>
      </div>

      {/* Skill tags */}
      <div className="px-6 py-5 flex flex-wrap gap-2">
        {category.skills.map((skill) => (
          <SkillTag key={skill.name} skill={skill} />
        ))}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SkillsPage() {
  const [activeTab, setActiveTab] = useState('foundations')

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <ParticleField />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-[#00d9ff] text-sm font-semibold tracking-widest mb-3">EXPERTISE</p>
          <h1 className="text-5xl md:text-6xl font-black text-white">Technical Expertise</h1>
        </div>

        {/* Globe */}
        <div className="relative w-full h-[680px] mb-16">
          <Globe3D />
        </div>

        {/* Tab bar — all tabs use cyan active state to match theme */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border"
              style={
                activeTab === cat.id
                  ? {
                      background: 'rgba(0,217,255,0.10)',
                      borderColor: 'rgba(0,217,255,0.45)',
                      color: CYAN,
                      boxShadow: '0 0 12px rgba(0,217,255,0.15)',
                    }
                  : {
                      background: 'transparent',
                      borderColor: 'rgba(255,255,255,0.10)',
                      color: 'rgba(255,255,255,0.40)',
                    }
              }
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all"
                style={{
                  background: activeTab === cat.id ? CYAN : 'rgba(255,255,255,0.2)',
                  boxShadow: activeTab === cat.id ? `0 0 6px ${CYAN}` : 'none',
                }}
              />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active panel */}
        <div>
          {SKILL_CATEGORIES.map((cat) => (
            <SkillPanel key={cat.id} category={cat} isActive={cat.id === activeTab} />
          ))}
        </div>
      </div>
    </div>
  )
}