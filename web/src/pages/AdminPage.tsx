import React, { useState, useEffect } from 'react'
import api from '../services/api'
import EventManager from '../components/EventManager'
import UserManager from '../components/UserManager'

// ===== Balance helpers =====

type DriftSummary = {
  avgMorale: number
  avgSupplies: number
  avgThreat: number
  days: number
}

function computeDrift(history: any[] | null): DriftSummary | null {
  if (!history || history.length < 2) return null

  let dm = 0
  let ds = 0
  let dt = 0

  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1].world
    const curr = history[i].world
    dm += curr.morale - prev.morale
    ds += curr.supplies - prev.supplies
    dt += curr.threat - prev.threat
  }

  const days = history.length - 1

  return {
    avgMorale: dm / days,
    avgSupplies: ds / days,
    avgThreat: dt / days,
    days,
  }
}

function driftLabel(value: number) {
  if (value > 1) return { label: 'Rising', className: 'text-green-400' }
  if (value < -1) return { label: 'Falling', className: 'text-red-400' }
  return { label: 'Stable', className: 'text-gray-300' }
}

type EventMix = {
  total: number
  byCategory: Record<string, number>
}

function computeEventMix(history: any[] | null, limit: number = 30): EventMix | null {
  if (!history || history.length === 0) return null

  const slice = history.slice(-limit) // last N days
  const byCategory: Record<string, number> = {}
  let total = 0

  slice.forEach(day => {
    const cat = day.event?.category || 'unknown'
    byCategory[cat] = (byCategory[cat] || 0) + 1
    total++
  })

  if (total === 0) return null
  return { total, byCategory }
}


const AdminPage: React.FC = () => {
  const [me, setMe] = useState<any>(null)
  const [metrics, setMetrics] = useState<any | null>(null)
  const [history, setHistory] = useState<any[] | null>(null)
  const [telemetry, setTelemetry] = useState<any[] | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users' | 'projects'>('overview')

  // Announcement state
  const [announceTitle, setAnnounceTitle] = useState('')
  const [announceContent, setAnnounceContent] = useState('')
  const [announceVersion, setAnnounceVersion] = useState('')
  const [announceTemplate, setAnnounceTemplate] = useState('standard')
  const [announcePopup, setAnnouncePopup] = useState(true)
  const [announceNotify, setAnnounceNotify] = useState(true)

  const drift = computeDrift(history)

  const eventMix = computeEventMix(history, 30) // last 30 days

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const user = await api.getMe()
      setMe(user)
      if (user?.authenticated && user?.user?.is_admin) {
        await loadAll()
      } else {
        setMsg('Admin access required. Please sign in with an admin account.')
      }
    } catch (e: any) {
      setMsg(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  const loadAll = async () => {
    try {
      const [metrics, history, telemetry] = await Promise.all([
        api.getMetrics(),
        api.getAdminHistory(),
        api.getTelemetry(),
      ])
      setMetrics(metrics)
      setHistory(history)
      setTelemetry(telemetry)
      setMsg(null)
    } catch (e: any) {
      setMsg(e?.error || e?.message || String(e))
    }
  }

  const [aiResult, setAiResult] = useState<any>(null)

  const handleTestAi = async () => {
    if (!confirm('Generate test AI content? This will consume API credits.')) return
    try {
      setLoading(true)
      const res = await api.adminTestAi()
      setAiResult(res)
      setMsg('AI generation successful')
    } catch (e: any) {
      setMsg(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleTick = async () => {
    if (!confirm('Are you sure you want to force a day tick? This cannot be undone.')) return
    try {
      const res = await api.adminTick()
      setMsg(`Day ticked successfully: ${JSON.stringify(res)}`)
      await loadAll()
    } catch (e: any) {
      setMsg(e?.error || e?.message || String(e))
    }
  }

  const handleTestNotification = async () => {
    try {
      const res = await api.testNotification()
      if (res.ok) {
        setMsg(`✅ Test notifications sent! Check your Nolofication dashboard and configured channels. Sent to: ${res.user}`)
      } else {
        setMsg(`⚠️ ${res.message || 'Failed to send test notifications'}. Results: ${JSON.stringify(res.results)}`)
      }
    } catch (e: any) {
      setMsg(`❌ Error: ${e?.error || e?.message || String(e)}`)
    }
  }

  const handleCancelTestReminders = async () => {
    try {
      const res = await api.cancelTestReminders()
      if (res.ok) {
        if (res.cancelled === 0) {
          setMsg(`ℹ️ ${res.message}. No pending vote reminders found for ${res.user}.`)
        } else {
          const details = res.pending.map((p: any) => `• ${p.title} (scheduled for ${new Date(p.scheduled_for).toLocaleString()})`).join('\n')
          setMsg(`✅ Cancelled ${res.cancelled} pending vote reminder(s) for ${res.user}:\n${details}`)
        }
      } else {
        setMsg(`⚠️ ${res.message || 'Failed to cancel test reminders'}`)
      }
    } catch (e: any) {
      setMsg(`❌ Error: ${e?.error || e?.message || String(e)}`)
    }
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm('Are you sure you want to broadcast this announcement to ALL users?')) return
    
    try {
      setLoading(true)
      await api.createAnnouncement({
        title: announceTitle,
        content: announceContent,
        version: announceVersion,
        template_id: announceTemplate,
        show_popup: announcePopup,
        send_notification: announceNotify
      })
      setMsg('✅ Announcement broadcast successfully!')
      setAnnounceTitle('')
      setAnnounceContent('')
      setAnnounceVersion('')
      setAnnounceTemplate('standard')
    } catch (e: any) {
      setMsg(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (!me?.authenticated || !me?.user?.is_admin) {
    return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-gray-400">{msg || 'Admin authentication required'}</p>
          </div>
          {!me?.authenticated ? (
            <button
              onClick={() => location.href = '/auth/login'}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              Sign In
            </button>
          ) : (
            <a
              href="/"
              className="inline-block glass-effect px-6 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Back to Home
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Background effects */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="space-y-8">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Admin Panel
              </h2>
              <p className="text-sm text-gray-400">System control and monitoring · Signed in as {me.user.display_name}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg'
                  : 'glass-effect-dark hover:bg-white/10'
                }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'users'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg'
                  : 'glass-effect-dark hover:bg-white/10'
                }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'events'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg'
                  : 'glass-effect-dark hover:bg-white/10'
                }`}
            >
              🎲 Events
            </button>
            <a
              href="/admin/projects"
              className="px-6 py-3 rounded-xl font-medium transition-all duration-200 glass-effect-dark hover:bg-white/10 flex items-center gap-2"
            >
              🏗️ Projects
            </a>
          </div>

          {/* Controls (only for overview tab) */}
          {activeTab === 'overview' && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadAll}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg glow"
              >
                🔄 Refresh Data
              </button>
              <button
                onClick={handleTick}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg glow-red"
              >
                ⚡ Tick Day
              </button>
              <button
                onClick={handleTestNotification}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                title="Send test notifications to yourself for both categories (day_results and vote_reminders)"
              >
                🧪 Test Notifications
              </button>
              <button
                onClick={handleTestAi}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                title="Generate a test AI event, summary, and chatter without saving"
              >
                🤖 Test AI Generation
              </button>
              <button
                onClick={handleTick}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                title="Force the simulation to advance to the next day immediately"
              >
                ⚡ Force Tick Day
              </button>
              <button
                onClick={handleCancelTestReminders}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                title="Cancel any pending vote reminder notifications for yourself (tests the cancel feature)"
              >
                🚫 Cancel Test Reminders
              </button>
            </div>
          )}

          {msg && activeTab === 'overview' && (
            <div className="mt-4 glass-effect-dark rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-yellow-300 font-mono break-all">{msg}</span>
            </div>
          )}
          
          {/* AI Test Results */}
          {aiResult && activeTab === 'overview' && (
            <div className="mt-6 glass-effect-dark rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                  <span className="text-2xl">🤖</span> AI Generation Test Result
                </h3>
                <button 
                  onClick={() => setAiResult(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Event */}
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-xs text-blue-400 uppercase font-bold mb-2">Generated Event</div>
                  <h4 className="text-xl font-bold text-white mb-2">{aiResult.event.headline}</h4>
                  <p className="text-gray-300 mb-4">{aiResult.event.description}</p>
                  
                  <div className="grid gap-2">
                    {aiResult.event.options.map((opt: any, i: number) => (
                      <div key={i} className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="flex justify-between">
                          <span className="font-bold text-indigo-300">{opt.label}</span>
                          <span className="text-xs text-gray-500 font-mono">
                            M:{opt.deltas.morale} S:{opt.deltas.supplies} T:{opt.deltas.threat} P:{opt.deltas.population}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{opt.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chatter */}
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-xs text-blue-400 uppercase font-bold mb-2">Generated Chatter</div>
                  <div className="space-y-3">
                    {aiResult.chatter.map((c: any, i: number) => (
                      <div key={i} className="bg-white/5 p-3 rounded">
                        <div className="text-sm text-white mb-2">"{c.content}"</div>
                        {c.replies && c.replies.length > 0 && (
                          <div className="pl-4 border-l-2 border-white/10 space-y-2 mt-2">
                            {c.replies.map((r: string, j: number) => (
                              <div key={j} className="text-xs text-gray-400">↳ "{r}"</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-xs text-blue-400 uppercase font-bold mb-2">Generated Summary</div>
                  <div className="text-sm text-gray-400 mb-2">
                    Simulated Choice: <span className="text-white font-bold">{aiResult.simulated_choice}</span>
                  </div>
                  <p className="text-gray-300 italic border-l-4 border-blue-500 pl-4 py-1">
                    "{aiResult.summary}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Feature Announcement */}
          {activeTab === 'overview' && (
            <section className="glass-effect rounded-2xl p-6 mt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📢</span> Broadcast Feature Announcement
              </h3>
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Template</label>
                    <select
                      value={announceTemplate}
                      onChange={e => setAnnounceTemplate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="standard">Standard (Text)</option>
                      <option value="ai_launch">AI Launch Special</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Channels</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={announcePopup}
                          onChange={e => setAnnouncePopup(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 text-sky-600 focus:ring-sky-500 bg-gray-700"
                        />
                        <span className="text-sm text-gray-300">Site Popup</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={announceNotify}
                          onChange={e => setAnnounceNotify(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 text-sky-600 focus:ring-sky-500 bg-gray-700"
                        />
                        <span className="text-sm text-gray-300">Nolofication</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={announceTitle}
                    onChange={e => setAnnounceTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500"
                    placeholder="e.g. New AI Features!"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Version (Optional)</label>
                  <input
                    type="text"
                    value={announceVersion}
                    onChange={e => setAnnounceVersion(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500"
                    placeholder="e.g. v0.4.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                  <textarea
                    value={announceContent}
                    onChange={e => setAnnounceContent(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500 h-32"
                    placeholder="Describe the new features..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Broadcasting...' : 'Broadcast to All Users'}
                </button>
              </form>
            </section>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'events' && <EventManager />}
        {activeTab === 'users' && <UserManager />}

        {activeTab === 'overview' && (
          <>
            {/* Balance Snapshot */}
            {history && (
              <section className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3v18h18M7 13l3 3 7-7"
                    />
                  </svg>
                  <span>Balance Snapshot {drift?.days ? `(last ${drift.days} days)` : ''}</span>
                </h3>

                {drift ? (
                  <>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      {/* Morale */}
                      <div className="glass-effect-dark rounded-xl p-4">
                        <div className="text-xs text-gray-400 uppercase mb-1">Morale Drift</div>
                        <div className="text-2xl font-bold text-white">
                          {drift.avgMorale.toFixed(1)}
                          <span className="text-sm text-gray-400 ml-1">/ day</span>
                        </div>
                        {(() => {
                          const { label, className } = driftLabel(drift.avgMorale)
                          return <div className={`text-xs mt-1 ${className}`}>{label}</div>
                        })()}
                      </div>

                      {/* Supplies */}
                      <div className="glass-effect-dark rounded-xl p-4">
                        <div className="text-xs text-gray-400 uppercase mb-1">Supplies Drift</div>
                        <div className="text-2xl font-bold text-white">
                          {drift.avgSupplies.toFixed(1)}
                          <span className="text-sm text-gray-400 ml-1">/ day</span>
                        </div>
                        {(() => {
                          const { label, className } = driftLabel(drift.avgSupplies)
                          return <div className={`text-xs mt-1 ${className}`}>{label}</div>
                        })()}
                      </div>

                      {/* Threat */}
                      <div className="glass-effect-dark rounded-xl p-4">
                        <div className="text-xs text-gray-400 uppercase mb-1">Threat Drift</div>
                        <div className="text-2xl font-bold text-white">
                          {drift.avgThreat.toFixed(1)}
                          <span className="text-sm text-gray-400 ml-1">/ day</span>
                        </div>
                        {(() => {
                          const { label, className } = driftLabel(drift.avgThreat)
                          return <div className={`text-xs mt-1 ${className}`}>{label}</div>
                        })()}
                      </div>
                    </div>

                    {/* Simple heuristics / alerts */}
                    <div className="text-sm text-gray-300">
                      {drift.avgMorale > 3 && drift.avgSupplies > 3 && drift.avgThreat < -1 && (
                        <div className="text-green-300">
                          ✅ Game looks very forgiving right now (might be too easy).
                        </div>
                      )}
                      {drift.avgSupplies < -5 && (
                        <div className="text-red-300">
                          ⚠️ Supplies are draining quickly on average. Consider buffing supply events or projects.
                        </div>
                      )}
                      {drift.avgThreat > 2 && (
                        <div className="text-red-300">
                          🔥 Threat is climbing fast. Players may feel constantly under siege.
                        </div>
                      )}
                      {Math.abs(drift.avgMorale) <= 1 && Math.abs(drift.avgSupplies) <= 1 && Math.abs(drift.avgThreat) <= 1 && (
                        <div className="text-gray-300">
                          ℹ️ Stats are roughly stable. Difficulty may depend mostly on specific events.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Not enough history yet to compute drift.</p>
                )}
              </section>
            )}

            {/* Event Mix (last 30 days) */}
            {eventMix && (
              <section className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 3.055A9 9 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464A5 5 0 0111 13"
                    />
                  </svg>
                  <span>Event Mix (last {eventMix.total} days)</span>
                </h3>

                <div className="grid md:grid-cols-4 gap-3 text-sm">
                  {Object.entries(eventMix.byCategory).map(([cat, count]) => {
                    const pct = (count / eventMix.total) * 100
                    const niceCat = cat === 'unknown' ? 'No event / unknown' : cat

                    // Basic expected ranges you can tweak:
                    // - general: often
                    // - opportunity: rare-ish (10–25%)
                    // - crisis: low but nonzero (5–15%)
                    // - narrative: whatever you want for story flavor
                    let hint: string | null = null
                    if (cat === 'crisis' && pct < 3) {
                      hint = 'Crises almost never trigger; difficulty may feel too gentle.'
                    } else if (cat === 'crisis' && pct > 20) {
                      hint = 'Crises are very common; this may feel punishing.'
                    } else if (cat === 'opportunity' && pct > 30) {
                      hint = 'Opportunities are very frequent; game may be too generous.'
                    }

                    return (
                      <div key={cat} className="bg-black/40 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-white capitalize">
                            {niceCat}
                          </span>
                          <span className="text-gray-400">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full bg-sky-400"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400">
                          {count} event{count !== 1 ? 's' : ''}
                        </div>
                        {hint && (
                          <div className="text-[11px] text-amber-300 mt-1">
                            {hint}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}


            {/* Metrics */}
            {metrics && (
              <section className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Metrics for {metrics.est_date}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-effect-dark rounded-xl p-5">
                    <h4 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Current Event</h4>
                    <div className="text-lg font-semibold text-white">{metrics.event.headline}</div>
                    <div className="text-sm text-gray-400 mt-2">Description: {metrics.event.description}</div>
                  </div>
                  <div className="glass-effect-dark rounded-xl p-5">
                    <h4 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Voting Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-gray-300">Total votes:</span><span className="font-bold text-indigo-400">{metrics.total_votes}</span></div>
                      <div className="flex justify-between"><span className="text-gray-300">Unique anon:</span><span className="font-bold text-purple-400">{metrics.unique_anon_voters}</span></div>
                      <div className="flex justify-between"><span className="text-gray-300">Unique users:</span><span className="font-bold text-green-400">{metrics.unique_user_voters}</span></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 glass-effect-dark rounded-xl p-5">
                  <h4 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Vote Distribution</h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {Object.entries(metrics.tally).map(([k, v]) => (
                      <div key={String(k)} className="bg-black/30 rounded-lg p-3 flex justify-between items-center">
                        <span className="font-medium capitalize">{String(k)}</span>
                        <span className="text-xl font-bold text-indigo-400">{String((v as any))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* History */}
            {history && (
              <section className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent History
                </h3>
                <div className="space-y-3">
                  {history.slice(-10).reverse().map(h => (
                    <div key={h.est_date} className="glass-effect-dark rounded-xl p-4 hover:bg-white/10 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-white mb-1">{h.est_date}</div>
                          <div className="text-sm text-gray-400">
                            Chosen: <span className="text-indigo-400 font-medium capitalize">{h.chosen_option}</span>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-gray-400">M:</span>
                            <span className="font-bold text-green-400">{h.world.morale}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                            <span className="text-gray-400">S:</span>
                            <span className="font-bold text-amber-400">{h.world.supplies}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-gray-400">T:</span>
                            <span className="font-bold text-red-400">{h.world.threat}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Telemetry */}
            {telemetry && (
              <section className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Recent Telemetry
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {telemetry.map((t, i) => (
                    <div key={i} className="glass-effect-dark rounded-lg p-3 font-mono text-xs">
                      <span className="text-indigo-400">[{t.event_type}]</span>{' '}
                      <span className="text-gray-300">{JSON.stringify(t.payload)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Back button */}
            <div className="flex justify-center pt-4">
              <a
                href="/"
                className="glass-effect px-6 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Simulation
              </a>
            </div>

            {/* Footer */}
            <footer className="glass-effect rounded-xl p-6 mt-8">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <a href="/terms" className="hover:text-white transition-colors">
                  Terms of Use
                </a>
                <span>•</span>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminPage
