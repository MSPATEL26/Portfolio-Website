'use client'

import { useEffect } from 'react'
import { X, Download, Eye, FileText, ScrollText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
}

const DOCS = [
  {
    id: 'resume',
    label: 'Resume',
    desc: '1-page snapshot — projects, skills, education',
    icon: FileText,
    color: '#00d9ff',
    // ── Put your actual file paths in /public/ ──
    previewUrl: '/Mohammed_Saqib_SDE_Resume.pdf',
    downloadUrl: '/Mohammed_Saqib_SDE_Resume.pdf',
    fileName: 'Mohammed_Saqib_SDE_Resume.pdf',
  },
  // {
  //   id: 'cv',
  //   label: 'Curriculum Vitae',
  //   desc: 'Full academic & professional record',
  //   icon: ScrollText,
  //   color: '#f59e0b',
  //   previewUrl: '/cv.pdf',
  //   downloadUrl: '/cv.pdf',
  //   fileName: 'Your_Name_CV.pdf',
  // },
]

export default function ResumeModal({ open, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-2xl border p-6"
              style={{
                background:   'rgba(10,10,10,0.95)',
                borderColor:  'rgba(0,217,255,0.20)',
                boxShadow:    '0 0 60px rgba(0,217,255,0.10), 0 24px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-bold text-lg tracking-tight">Documents</h2>
                  <p className="text-white/35 text-xs font-mono mt-0.5">Choose what you want to access</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DOCS.map((doc) => {
                  const Icon = doc.icon
                  return (
                    <div
                      key={doc.id}
                      className="rounded-xl border p-4 flex flex-col gap-4 transition-all duration-200"
                      style={{
                        background:  `${doc.color}08`,
                        borderColor: `${doc.color}25`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${doc.color}50`
                        e.currentTarget.style.boxShadow   = `0 0 20px ${doc.color}15`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${doc.color}25`
                        e.currentTarget.style.boxShadow   = 'none'
                      }}
                    >
                      {/* Icon + label */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${doc.color}15`, border: `1px solid ${doc.color}30` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: doc.color }} />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{doc.label}</p>
                          <p className="text-white/35 text-[10px] font-mono leading-tight mt-0.5">
                            {doc.desc}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {/* Preview */}
                        <a
                          href={doc.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-all duration-200"
                          style={{
                            borderColor: `${doc.color}30`,
                            color:        doc.color,
                            background:  'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${doc.color}12`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                        </a>

                        {/* Download */}
                        <a
                          href={doc.downloadUrl}
                          download={doc.fileName}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                          style={{
                            background: doc.color,
                            color:      '#000',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.85'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1'
                          }}
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer note */}
              <p className="text-center text-white/20 text-[10px] font-mono mt-5">
                PDF format · Last updated June 2026
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}