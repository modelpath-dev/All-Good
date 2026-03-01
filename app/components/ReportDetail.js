'use client'
import { useState } from 'react'
import AnalysisCards from './AnalysisCards'
import ChatPanel from './ChatPanel'

export default function ReportDetail({ report, userId, onBack, onAnalyzed }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(report.analysis)
  const [showChat, setShowChat] = useState(false)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(report.file_name)
  const [deleting, setDeleting] = useState(false)

  const isAnalyzed = !!analysis

  async function handleAnalyze() {
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id })
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAnalysis(data.report?.analysis || data.analysis)
      onAnalyzed()
    } catch {
      setError('Failed to analyze. Try again.')
    }
    setAnalyzing(false)
  }

  async function handleRename() {
    if (!name.trim() || name.trim() === report.file_name) {
      setName(report.file_name)
      setEditing(false)
      return
    }
    try {
      const res = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id, newName: name.trim() })
      })
      if (!res.ok) throw new Error()
      report.file_name = name.trim()
      onAnalyzed()
    } catch {
      setName(report.file_name)
    }
    setEditing(false)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id })
      })
      if (!res.ok) throw new Error()
      onBack()
    } catch {
      setError('Failed to delete.')
      setDeleting(false)
    }
  }

  return (
    <div className="fade-in">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-4 py-3 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={e => e.key === 'Enter' && handleRename()}
                className="text-sm font-bold text-gray-900 dark:text-gray-50 bg-transparent border-b border-teal-400 outline-none w-full py-0.5"
              />
            ) : (
              <div
                onClick={() => setEditing(true)}
                className="cursor-pointer group"
              >
                <p className="text-sm font-bold text-gray-900 dark:text-gray-50 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {name}
                  <svg className="inline ml-1.5 text-teal-500 dark:text-teal-400 opacity-70 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </p>
                <p className="text-[10px] text-teal-500/60 dark:text-teal-400/50 font-medium mt-0.5">Tap name to rename</p>
              </div>
            )}
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {new Date(report.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
              isAnalyzed
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}>
              {isAnalyzed ? 'Analyzed' : 'Stored'}
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Delete report"
            >
              {deleting ? (
                <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-20 space-y-4">
        {!isAnalyzed && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full py-3.5 bg-teal-600 text-white rounded-2xl font-semibold text-sm disabled:opacity-50 active:bg-teal-700 transition-all shadow-sm"
          >
            {analyzing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing report...
              </span>
            ) : 'Analyze This Report'}
          </button>
        )}

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        {isAnalyzed && (
          <>
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">Analysis</h3>
              <AnalysisCards text={analysis} />
            </div>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all border ${
                showChat
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  : 'bg-white dark:bg-gray-900 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800 active:bg-teal-50 dark:active:bg-teal-900/30'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {showChat ? 'Hide Chat' : 'Chat About This Report'}
              </span>
            </button>

            {showChat && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 border border-gray-100 dark:border-gray-800 fade-in transition-colors">
                <ChatPanel userId={userId} reportId={report.id} compact />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
