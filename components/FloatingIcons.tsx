'use client'

import { motion } from 'framer-motion'

const techItems = [
  { name: 'React', symbol: '⚛', color: '#61DAFB', top: '15%', left: '8%' },
  { name: 'Next.js', symbol: 'N', color: '#ffffff', top: '25%', left: '85%' },
  { name: 'TypeScript', symbol: 'TS', color: '#3178C6', top: '65%', left: '5%' },
  { name: 'Python', symbol: 'Py', color: '#3776AB', top: '70%', left: '88%' },
  { name: 'Docker', symbol: '🐳', color: '#2496ED', top: '40%', left: '92%' },
  { name: 'Git', symbol: '⑂', color: '#F05032', top: '10%', left: '75%' },
  { name: 'FastAPI', symbol: 'FA', color: '#009688', top: '80%', left: '70%' },
  { name: 'ML', symbol: '🤖', color: '#FF6B6B', top: '50%', left: '3%' },
]

export default function FloatingIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {techItems.map((item, i) => (
        <motion.div
          key={item.name}
          className="absolute flex flex-col items-center gap-1"
          style={{ top: item.top, left: item.left }}
          animate={{
            y: [0, -20, 0],
            x: [0, i % 2 === 0 ? 10 : -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{
              background: `${item.color}15`,
              border: `1px solid ${item.color}40`,
              color: item.color,
            }}
          >
            {item.symbol}
          </div>
          <span className="text-xs text-white/30">{item.name}</span>
        </motion.div>
      ))}
    </div>
  )
}
