import React, { useState, useEffect, useCallback } from 'react'
import useFetch from '../hooks/useFetch'
import { default as api } from '../services/api'
import StatBar from '../components/StatBar'
import EventCard from '../components/EventCard'
import EventHistory from '../components/EventHistory'
import CommunityBoard from '../components/CommunityBoard'
import Header from '../components/Header'
import WelcomeModal from '../components/WelcomeModal'
import BaseDashboard from '../components/BaseDashboard'

type WorldState = { day: number; morale: number; supplies: number; threat: number; last_event: string; production?: number }
type EventData = { day: number; headline: string; description: string; options: string[] }

const Home: React.FC = () => {
  const { data: world } = useFetch<WorldState>('/api/state', [])
  const { data: event } = useFetch<EventData>('/api/event', [])
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [tally, setTally] = useState<Record<string, number>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [me, setMe] = useState<any>(null)
  const [currentVote, setCurrentVote] = useState<string | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [historyPage, setHistoryPage] = useState<number>(1)
  const [historyPages, setHistoryPages] = useState<number>(1)
  const [historyTotal, setHistoryTotal] = useState<number>(0)
  const [historyPerPage] = useState<number>(6)
  const [historySearch, setHistorySearch] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  const [projectsData, setProjectsData] = useState<any>(null)

  // Fetch user info
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await api.getMe()
        setMe(data)
      } catch (e) {
        console.error('Failed to fetch user info:', e)
      }
    }
    fetchMe()
  }, [])

  // Fetch current vote
  useEffect(() => {
    const fetchMyVote = async () => {
      try {
        const data = await api.getMyVote()
        if (data.voted) {
          setCurrentVote(data.choice)
        }
      } catch (e) {
        console.error('Failed to fetch vote:', e)
      }
    }
    if (me?.authenticated) {
      fetchMyVote()
    }
  }, [me])

  // Fetch event history with pagination/search
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getHistoryPage(historyPage, historyPerPage, historySearch || undefined)
        setHistory(data.history || [])
        setHistoryPages(data.pages || 1)
        setHistoryTotal(data.total || 0)
      } catch (e) {
        console.error('Failed to fetch history:', e)
      }
    }
    fetchHistory()
  }, [historyPage, historyPerPage, historySearch])

  // Fetch community messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await api.getCommunityMessages()
        setMessages(data)
      } catch (e) {
        console.error('Failed to fetch messages:', e)
      }
    }
    fetchMessages()
  }, [])

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const data = await api.getProjects()
      setProjectsData(data)
    } catch (e) {
      console.error('Failed to fetch projects:', e)
    }
  }

  useEffect(() => {
    fetchProjects()
    // Refresh projects occasionally
    const interval = setInterval(fetchProjects, 10000)
    return () => clearInterval(interval)
  }, [])

  // Fetch initial tally
  useEffect(() => {
    const fetchTally = async () => {
      try {
        const data = await api.getTally()
        setTally(data)
      } catch (e) {
        console.error('Failed to fetch tally:', e)
      }
    }
    fetchTally()
    // Refresh tally every 5 seconds
    const interval = setInterval(fetchTally, 5000)
    return () => clearInterval(interval)
  }, [])

  const vote = async (choice: string) => {
    setSubmitting(choice)
    setMessage(null)
    try {
      const json = await api.vote(choice)
      setTally(json.tally || {})
      setCurrentVote(choice)
      if (json.changed) {
        setMessage(`Changed vote to ${choice}`)
      } else {
        setMessage(`Registered vote for ${choice}`)
      }
    } catch (e: any) {
      setMessage(e?.error || e?.message || String(e))
    } finally {
      setSubmitting(null)
    }
  }

  const handleProjectVote = async (projectId: number) => {
    try {
      await api.voteProject(projectId)
      // Refresh projects to show updated vote count
      fetchProjects()
    } catch (e: any) {
      console.error('Project vote failed:', e)
      alert(e.message || 'Failed to vote for project')
    }
  }

  // Determine simulation status for dynamic backgrounds
  const getSimulationStatus = () => {
    if (!world) return 'stable'

    const criticalStats = [
      world.morale < 30,
      world.supplies < 30,
      world.threat >= 60
    ].filter(Boolean).length

    if (criticalStats >= 2) return 'critical'
    if (criticalStats === 1) return 'warning'
    if (world.morale >= 70 && world.supplies >= 70 && world.threat <= 30) return 'thriving'
    return 'stable'
  }

  const status = getSimulationStatus()

  // Dynamic background colors based on status
  const getBackgroundEffects = () => {
    switch (status) {
      case 'critical':
        return {
          orb1: 'bg-red-600/30',
          orb2: 'bg-orange-600/30',
          pulse: 'animate-pulse',
          vignette: 'radial-gradient(circle at center, transparent 0%, rgba(139, 0, 0, 0.3) 100%)'
        }
      case 'warning':
        return {
          orb1: 'bg-yellow-500/25',
          orb2: 'bg-orange-500/25',
          pulse: 'animate-pulse',
          vignette: 'radial-gradient(circle at center, transparent 0%, rgba(120, 53, 15, 0.2) 100%)'
        }
      case 'thriving':
        return {
          orb1: 'bg-green-500/25',
          orb2: 'bg-emerald-500/25',
          pulse: '',
          vignette: 'radial-gradient(circle at center, transparent 0%, rgba(6, 78, 59, 0.2) 100%)'
        }
      default:
        return {
          orb1: 'bg-indigo-500/20',
          orb2: 'bg-purple-500/20',
          pulse: '',
          vignette: 'none'
        }
    }
  }

  const bgEffects = getBackgroundEffects()

  const handleHistorySearch = useCallback((s: string) => { setHistorySearch(s); setHistoryPage(1) }, [])

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto relative">
      {/* Welcome Modal for first-time users */}
      <WelcomeModal
        isAuthenticated={me?.authenticated || false}
        username={me?.user?.username}
      />

      {/* Dynamic animated background effects */}
      <div className="fixed inset-0 -z-20">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${bgEffects.orb1} rounded-full blur-3xl ${bgEffects.pulse}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${bgEffects.orb2} rounded-full blur-3xl ${bgEffects.pulse}`} style={{ animationDelay: '1s' }} />
        {status === 'critical' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        )}
      </div>

      {/* Vignette overlay for atmosphere */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: bgEffects.vignette }}
      />

      <div className="space-y-8">
        <Header />

        {/* World stats */}
        {world && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatBar label="Morale" value={world.morale} color="#10b981" />
            <StatBar label="Supplies" value={world.supplies} color="#f59e0b" />
            <StatBar label="Threat" value={world.threat} color="#ef4444" />
            <StatBar label="Production" value={world.production || 0} color="#3b82f6" max={50} />
          </div>
        )}

        {/* Current event */}
        {event && (
          <EventCard
            event={event}
            onVote={vote}
            tally={tally}
            submitting={submitting}
            message={message}
            isAuthenticated={me?.authenticated || false}
            currentVote={currentVote}
          />
        )}

        {/* Base Dashboard */}
        {projectsData && (
          <BaseDashboard
            projects={projectsData.projects}
            activeProject={projectsData.active_project}
            completedCount={projectsData.completed_count}
            onVote={handleProjectVote}
            isAuthenticated={me?.authenticated || false}
          />
        )}

        {/* Event history */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <EventHistory
              history={history}
              page={historyPage}
              pages={historyPages}
              total={historyTotal}
              perPage={historyPerPage}
              search={historySearch}
              onPageChange={(p) => setHistoryPage(p)}
              onSearch={handleHistorySearch}
            />
          </div>
          <div className="md:col-span-1">
            <CommunityBoard messages={messages} />
          </div>
        </div>

        {/* Footer */}
        <footer className="glass-effect rounded-xl p-6 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Day {world?.day ?? 0}</span>
              </div>
              {world?.last_event && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="truncate max-w-xs">Last: {world.last_event}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 glass-effect-dark rounded-full">Beta v0.2.2</span>
              {me?.authenticated && me?.user?.is_admin && (
                <a href="/admin" className="px-3 py-1 glass-effect-dark rounded-full hover:bg-white/10 transition-colors">
                  Admin
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10 text-xs">
            <a href="/terms" className="hover:text-white transition-colors">
              Terms of Use
            </a>
            <span>•</span>
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Home
