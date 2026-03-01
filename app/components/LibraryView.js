'use client'
import { useRef, useState } from 'react'

const MAX_FILE_SIZE = 4 * 1024 * 1024

export default function LibraryView({ reports, selectedUser, onReportTap, onUploadDone }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const fileRef = useRef(null)

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (f && f.size > MAX_FILE_SIZE) {
      setError('File too large. Max 4MB.')
      return
    }
    setFile(f || null)
    setError(null)
    setSuccess(false)
  }

  async function handleUpload() {
    if (!file || !selectedUser) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', selectedUser)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      setFile(null)
      setSuccess(true)
      if (fileRef.current) fileRef.current.value = ''
      setTimeout(() => setSuccess(false), 3000)
      onUploadDone()
    } catch {
      setError('Failed to store report. Try again.')
    }
    setUploading(false)
  }

  async function handleDelete(e, reportId) {
    e.stopPropagation()
    if (deletingId) return
    setDeletingId(reportId)
    try {
      const res = await fetch('/api/reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId })
      })
      if (!res.ok) throw new Error()
      onUploadDone()
    } catch {
      setError('Failed to delete.')
      setTimeout(() => setError(null), 2000)
    }
    setDeletingId(null)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Upload Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-50">Upload Report</h2>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">PDF or photo — stored for you</p>
          </div>
          {success && (
            <span className="text-[11px] bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full font-semibold fade-in">
              Stored
            </span>
          )}
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center cursor-pointer active:border-teal-400 dark:active:border-teal-600 transition-colors"
        >
          {file ? (
            <div>
              <svg className="mx-auto mb-1 text-teal-500" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{file.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          ) : (
            <div>
              <svg className="mx-auto mb-1 text-gray-300 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p className="text-xs text-gray-400 dark:text-gray-500">Tap to select</p>
              <p className="text-[10px] text-gray-300 dark:text-gray-600">PDF, JPG, PNG</p>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="application/pdf,image/*" onChange={handleFileChange} className="hidden" />

        {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}

        <button
          onClick={handleUpload}
          disabled={!file || uploading || !selectedUser}
          className="w-full mt-3 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm disabled:opacity-30 active:bg-teal-700 transition-all"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Storing...
            </span>
          ) : 'Store Report'}
        </button>
      </div>

      {/* Report List */}
      {reports.length === 0 ? (
        <div className="text-center py-10">
          <svg className="mx-auto mb-2 text-gray-200 dark:text-gray-700" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p className="text-gray-400 dark:text-gray-500 text-xs">No reports yet</p>
        </div>
      ) : (
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
            All Reports ({reports.length})
          </h3>
          <div className="space-y-2">
            {reports.map(report => (
              <div
                key={report.id}
                onClick={() => onReportTap(report)}
                className="w-full text-left bg-white dark:bg-gray-900 rounded-xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{report.file_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        {new Date(report.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                      {!(report.status === 'analyzed' || report.analysis) && (
                        <span className="text-[10px] text-teal-500 dark:text-teal-400 font-medium">— Tap to analyze</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                      report.status === 'analyzed' || report.analysis
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {report.status === 'analyzed' || report.analysis ? 'Analyzed' : 'Stored'}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, report.id)}
                      disabled={deletingId === report.id}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label="Delete report"
                    >
                      {deletingId === report.id ? (
                        <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      )}
                    </button>
                    <svg className="text-gray-300 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
