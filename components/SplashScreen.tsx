'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  onDone: () => void
}

const NAME = 'your-username.me'

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), 2000)
    const doneTimer = setTimeout(onDone, 2500)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#020408]"
        >
          {/* Letter-by-letter name */}
          <div className="flex items-center gap-[2px]" aria-label={NAME}>
            {NAME.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.07,
                  duration: 0.25,
                  ease: 'easeOut',
                }}
                className={`text-2xl tracking-tight font-mono ${
                  char === '.' ? 'text-[#00d9ff]' : 'text-white'
                }`}
              >
                {char}
              </motion.span>
            ))}

            {/* Blinking cursor */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{
                delay: NAME.length * 0.07 + 0.1,
                duration: 0.8,
                repeat: Infinity,
                times: [0, 0.1, 0.5, 0.6],
              }}
              className="ml-0.5 inline-block w-[2px] h-6 bg-[#00d9ff]"
            />
          </div>

          {/* Underline draws left → right */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: NAME.length * 0.07 + 0.15,
              duration: 0.4,
              ease: 'easeOut',
            }}
            className="mt-2 h-px w-48 bg-[#00d9ff]/40 origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}