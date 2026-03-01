'use client'
import { useState, useRef, useEffect } from 'react'

function formatMessage(text) {
  if (!text) return text
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return <br key={i} />

    const isBullet = trimmed.startsWith('- ')
    const content = isBullet ? trimmed.slice(2) : trimmed

    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
      }
      return <span key={j}>{part}</span>
    })

    if (isBullet) {
      return (
        <div key={i} className="flex items-start gap-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 mt-1.5 flex-shrink-0" />
          <span>{parts}</span>
        </div>
      )
    }

    return <p key={i} className="py-0.5">{parts}</p>
  })
}

export default function ChatPanel({ userId, reportId, compact }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setMessages([])
  }, [userId, reportId])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userId, reportId, history: messages })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    }
    setLoading(false)
  }

  const suggestions = reportId
    ? ['Explain this report simply', 'What should the patient eat?', 'Is this concerning?']
    : ['How is the patient doing overall?', 'What diet should be followed?', 'Compare the recent reports']

  return (
    <div className={compact ? '' : 'flex flex-col h-full'}>
      <div className={`space-y-3 ${compact ? '' : 'flex-1 overflow-y-auto p-4'}`}>
        {messages.length === 0 && (
          <div className={compact ? 'pt-2' : 'text-center py-6'}>
            {!compact && (
              <>
                <svg className="mx-auto mb-3 text-gray-200 dark:text-gray-700" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-1">Ask about the reports</p>
                <p className="text-gray-300 dark:text-gray-600 text-xs mb-4">Simple answers, no jargon</p>
              </>
            )}
            <div className="space-y-2">
              {suggestions.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="block w-full text-left text-xs bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-500 dark:text-gray-400 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'user'
                ? 'bg-teal-600 text-white rounded-br-md'
                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-bl-md shadow-sm'
            }`}>
              <div className="leading-relaxed">{msg.role === 'user' ? msg.content : formatMessage(msg.content)}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start fade-in">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className={compact ? 'mt-3' : 'p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-lg transition-colors'}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={reportId ? 'Ask about this report...' : 'Ask about the reports...'}
            className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-teal-400 dark:focus:border-teal-600 transition-colors"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 flex items-center justify-center bg-teal-600 text-white rounded-xl disabled:opacity-30 active:bg-teal-700 transition-all flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
