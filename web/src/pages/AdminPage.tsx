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
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users'>('overview')

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

  const handleTick = async () => {
    try {
      const res = await api.adminTick()
      setMsg(`Day ticked successfully: ${JSON.stringify(res)}`)
      await loadAll()
    } catch (e: any) {
      setMsg(e?.error || e?.message || String(e))
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
