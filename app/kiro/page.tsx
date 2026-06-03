'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, RotateCcw, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  "Who is Saqib Patel?",
  "What projects has he built?",
  "What's his tech stack?",
  "Is he open to opportunities?",
  "What certifications does he have?",
]

// Render markdown bold/code inline cleanly
function MessageText({ text }: { text: string }) {
  // Split on **bold** and `code` patterns
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="text-[#00d9ff] bg-[#00d9ff]/10 px-1 py-0.5 rounded text-[11px] font-mono">{part.slice(1, -1)}</code>
        }
        // Handle bullet points (* item or + item)
        if (part.includes('\n')) {
          return (
            <span key={i}>
              {part.split('\n').map((line, j) => {
                const bullet = line.match(/^[\*\+\-] (.+)/)
                if (bullet) {
                  return (
                    <span key={j} className="flex items-start gap-1.5 mt-1">
                      <span className="text-[#00d9ff] mt-0.5 flex-shrink-0">·</span>
                      <span>{bullet[1]}</span>
                    </span>
                  )
                }
                return <span key={j}>{line}{j < part.split('\n').length - 1 && <br />}</span>
              })}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

export default function KiroPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const textareaRef             = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [input])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res  = await fetch('/api/kiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages([...next, { role: 'assistant', content: data.content ?? data.error ?? 'Something went wrong.' }])
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Network error — please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative h-screen overflow-hidden bg-[#0a0a0a] pt-20 pb-0 flex flex-col">      <div className="max-w-2xl w-full mx-auto px-4 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>

        {/* Header */}
        <div className="text-center py-5 flex-shrink-0">
          <div
            className="inline-flex items-center justify-center w-11 h-11 rounded-2xl border border-[#00d9ff]/30 bg-[#00d9ff]/08 mb-3"
            style={{ boxShadow: '0 0 20px rgba(0,217,255,0.15)' }}
          >
            <Bot className="w-5 h-5 text-[#00d9ff]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">KIRO</h1>
          <p className="text-white/30 text-xs font-mono mt-0.5">AI assistant for Saqib Patel</p>
        </div>

        {/* Chat window — fills remaining height */}
        <div
          className="flex-1 rounded-2xl border flex flex-col overflow-hidden mb-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderColor: 'rgba(0,217,255,0.15)',
            boxShadow: '0 0 0 1px rgba(0,217,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" data-lenis-prevent>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-5 py-6">
                <p className="text-white/20 text-xs font-mono">Ask anything about Saqib or his work</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs font-mono text-white/35 px-3 py-1.5 rounded-lg border border-white/08 bg-white/[0.02] hover:border-[#00d9ff]/30 hover:text-[#00d9ff]/60 hover:bg-[#00d9ff]/[0.04] transition-all duration-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg border border-[#00d9ff]/25 bg-[#00d9ff]/08 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-[#00d9ff]" />
                  </div>
                )}
                <div
                  className="max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed"
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'rgba(0,217,255,0.10)',
                          border: '1px solid rgba(0,217,255,0.20)',
                          color: 'rgba(255,255,255,0.85)',
                          borderRadius: '14px 3px 14px 14px',
                        }
                      : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: 'rgba(255,255,255,0.65)',
                          borderRadius: '3px 14px 14px 14px',
                        }
                  }
                >
                  <MessageText text={msg.content} />
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg border border-white/12 bg-white/05 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3 h-3 text-white/40" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg border border-[#00d9ff]/25 bg-[#00d9ff]/08 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-[#00d9ff]" />
                </div>
                <div
                  className="px-3.5 py-2.5 flex items-center gap-1.5"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '3px 14px 14px 14px',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#00d9ff]/50"
                      style={{ animation: `kiro-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="flex-shrink-0 p-3 border-t" style={{ borderColor: 'rgba(0,217,255,0.08)' }}>
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
                }}
                placeholder="Ask about Saqib's projects, skills, or certifications…"
                rows={1}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white/80 placeholder-white/20 font-mono resize-none outline-none focus:border-[#00d9ff]/30 focus:shadow-[0_0_0_1px_rgba(0,217,255,0.08)] transition-all"
                style={{ maxHeight: '120px' }}
              />
              <div className="flex gap-1.5 flex-shrink-0">
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])}
                    className="p-2.5 rounded-xl border border-white/08 bg-white/[0.02] hover:border-white/15 text-white/25 hover:text-white/50 transition-all"
                    title="Clear chat"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl border transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                  style={{
                    background: input.trim() && !loading ? 'rgba(0,217,255,0.12)' : 'transparent',
                    borderColor: input.trim() && !loading ? 'rgba(0,217,255,0.35)' : 'rgba(255,255,255,0.08)',
                    boxShadow: input.trim() && !loading ? '0 0 10px rgba(0,217,255,0.12)' : 'none',
                  }}
                >
                  <Send className="w-3.5 h-3.5 text-[#00d9ff]" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-white/15 font-mono mt-1.5 text-center">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes kiro-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  )

}