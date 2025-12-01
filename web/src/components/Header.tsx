import React, { useEffect, useState } from 'react'
import api from '../services/api'

const Header: React.FC = () => {
  const [me, setMe] = useState<any>(null)
  useEffect(() => {
    let mounted = true
    api.getMe().then(j => { if (mounted) setMe(j) }).catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <header className="glass-effect rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg glow">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                The Simulation
              </h1>
              <p className="text-sm text-gray-400 font-light">Collective choices sculpt a persistent world</p>
            </div>
          </div>
        </div>
        <div>
          {me?.authenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 glass-effect-dark px-4 py-2 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {(me.user?.display_name || 'P')[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-200 font-medium">{me.user?.display_name || 'Player'}</span>
              </div>
              <button
                className="text-sm glass-effect-dark hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                onClick={() => window.open('https://nolofication.bynolo.ca/sites/thesimulation/preferences', '_blank')}
                title="Manage notification preferences"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notifications
              </button>
              <button
                className="text-sm glass-effect-dark hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={async () => { await fetch('/auth/logout', { method: 'POST' }); location.reload() }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg glow"
              onClick={() => { location.href = '/auth/login' }}
            >
              Sign in to vote
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
