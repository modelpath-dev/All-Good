'use client'
import { useState } from 'react'
import ComparisonCards from './ComparisonCards'

export default function CompareView({ reports }) {
  const [reportA, setReportA] = useState('')
  const [reportB, setReportB] = useState('')
  const [comparison, setComparison] = useState(null)
  const [comparing, setComparing] = useState(false)
  const [error, setError] = useState(null)

  const analyzed = reports.filter(r => r.analysis || r.status === 'analyzed')

  async function handleCompare() {
    if (!reportA || !reportB) return
    setComparing(true)
    setError(null)
    setComparison(null)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportIdA: parseInt(reportA), reportIdB: parseInt(reportB) })
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setComparison(data.comparison)
    } catch {
      setError('Failed to compare. Make sure both reports are analyzed.')
    }
    setComparing(false)
  }

  function formatLabel(r) {
    const date = new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${r.file_name} — ${date}`
  }

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center'
  }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-50 mb-1">Compare Reports</h2>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4">Pick two analyzed reports to compare</p>

        {analyzed.length < 2 ? (
          <div className="text-center py-6">
            <svg className="mx-auto mb-2 text-gray-200 dark:text-gray-700" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <p className="text-xs text-gray-400 dark:text-gray-500">Need at least 2 analyzed reports</p>
            <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-0.5">Analyze reports from the Library first</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Older Report</label>
              <select value={reportA} onChange={e => setReportA(e.target.value)} className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-gray-50/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 appearance-none transition-colors" style={selectStyle}>
                <option value="">Select report...</option>
                {analyzed.map(r => (
                  <option key={r.id} value={String(r.id)} disabled={String(r.id) === reportB}>{formatLabel(r)}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Newer Report</label>
              <select value={reportB} onChange={e => setReportB(e.target.value)} className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-gray-50/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 appearance-none transition-colors" style={selectStyle}>
                <option value="">Select report...</option>
                {analyzed.map(r => (
                  <option key={r.id} value={String(r.id)} disabled={String(r.id) === reportA}>{formatLabel(r)}</option>
                ))}
              </select>
            </div>

            <button onClick={handleCompare} disabled={!reportA || !reportB || comparing} className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm disabled:opacity-30 active:bg-teal-700 transition-all">
              {comparing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Comparing...
                </span>
              ) : 'Compare Reports'}
            </button>
          </>
        )}

        {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
      </div>

      {comparison && (
        <div className="fade-in">
          <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">Comparison</h3>
          <ComparisonCards text={comparison} />
        </div>
      )}
    </div>
  )
}
