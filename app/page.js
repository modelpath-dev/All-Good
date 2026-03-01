'use client'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import LibraryView from './components/LibraryView'
import ReportDetail from './components/ReportDetail'
import CompareView from './components/CompareView'
import ChatPanel from './components/ChatPanel'

export default function Home() {
  const [activeTab, setActiveTab] = useState('library')
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [reports, setReports] = useState([])
  const [detailReport, setDetailReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserName, setNewUserName] = useState('')

  useEffect(() => { initApp() }, [])

  useEffect(() => {
    if (selectedUser) {
      loadReports()
      setDetailReport(null)
    }
  }, [selectedUser])

  async function initApp() {
    try {
      await fetch('/api/setup', { method: 'POST' })
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data.users || [])
      const defaultUser = data.users?.find(u => u.name === 'RAM NARESH UTTAM')
      if (defaultUser) setSelectedUser(String(defaultUser.id))
      else if (data.users?.length > 0) setSelectedUser(String(data.users[0].id))
    } catch {
      setError('Could not connect to database.')
    }
    setLoading(false)
  }

  async function loadReports() {
    try {
      const res = await fetch(`/api/reports?userId=${selectedUser}`)
      const data = await res.json()
      setReports(data.reports || [])
    } catch {
      console.error('Failed to load reports')
    }
  }

  async function addUser() {
    if (!newUserName.trim()) return
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName.trim().toUpperCase() })
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUsers(prev => [...prev, data.user])
      setSelectedUser(String(data.user.id))
      setNewUserName('')
      setShowAddUser(false)
    } catch {
      setError('Failed to add. User may already exist.')
      setTimeout(() => setError(null), 3000)
    }
  }

  function handleReportTap(report) {
    setDetailReport(report)
  }

  function handleBack() {
    setDetailReport(null)
    loadReports()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-500 text-xs">Loading...</p>
        </div>
      </div>
    )
  }

  // Detail View — fullscreen overlay
  if (detailReport) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto transition-colors">
        <ReportDetail
          report={detailReport}
          userId={selectedUser}
          onBack={handleBack}
          onAnalyzed={loadReports}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col max-w-md mx-auto relative transition-colors">
      <Header
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        onAddUser={() => setShowAddUser(!showAddUser)}
      />

      {/* Add User Form */}
      {showAddUser && (
        <div className="px-4 pt-2 pb-1 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 fade-in transition-colors">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New patient name"
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addUser()}
              className="flex-1 text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-teal-400 dark:focus:border-teal-600 transition-colors"
            />
            <button
              onClick={addUser}
              className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold active:bg-teal-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center justify-between fade-in transition-colors">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 text-red-400 dark:text-red-500 font-bold">&times;</button>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${activeTab === 'chat' ? 'pb-0' : 'pb-16'}`}>
        {activeTab === 'library' && (
          <LibraryView
            reports={reports}
            selectedUser={selectedUser}
            onReportTap={handleReportTap}
            onUploadDone={loadReports}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView reports={reports} />
        )}

        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-120px)] flex flex-col">
            <ChatPanel userId={selectedUser} />
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      {activeTab !== 'chat' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Chat tab has its own sticky nav */}
      {activeTab === 'chat' && (
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 max-w-md mx-auto w-full transition-colors">
          <div className="flex">
            {['library', 'compare', 'chat'].map(id => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 py-2.5 text-center transition-colors ${
                  activeTab === id ? 'text-teal-600 dark:text-teal-400' : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                <span className="text-[10px] font-semibold capitalize">{id}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
