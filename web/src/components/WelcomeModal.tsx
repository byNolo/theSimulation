import React, { useState, useEffect } from 'react'

interface WelcomeModalProps {
  isAuthenticated: boolean
  username?: string
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isAuthenticated, username }) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show if user is authenticated
    if (isAuthenticated) {
      // Use username-specific key so each user sees welcome once
      const storageKey = username ? `hasSeenWelcome_${username}` : 'hasSeenWelcome'
      const hasSeenWelcome = localStorage.getItem(storageKey)
      
      if (!hasSeenWelcome) {
        // Small delay to ensure page is loaded
        const timer = setTimeout(() => {
          setShow(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [isAuthenticated, username])

  const handleClose = () => {
    const storageKey = username ? `hasSeenWelcome_${username}` : 'hasSeenWelcome'
    localStorage.setItem(storageKey, 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-effect rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Welcome to The Simulation!
          </h2>
          <p className="text-gray-400">Hello, <span className="text-white font-semibold">{username}</span></p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-gray-300">
          {/* What is it */}
          <div className="glass-effect-dark rounded-xl p-5">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              What is The Simulation?
            </h3>
            <p className="leading-relaxed">
              A multiplayer social experiment where <strong className="text-white">collective choices shape a persistent world</strong>. 
              Every day, the community votes on how to respond to events. Your decisions impact three critical stats:
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-green-400 font-bold text-lg">Morale</div>
                <div className="text-xs text-gray-400">Mental well-being</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-amber-400 font-bold text-lg">Supplies</div>
                <div className="text-xs text-gray-400">Resources</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-red-400 font-bold text-lg">Threat</div>
                <div className="text-xs text-gray-400">External danger</div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="glass-effect-dark rounded-xl p-5">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">🗳️</span>
              How It Works
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">1.</span>
                <span><strong className="text-white">Each day brings a new event</strong> — a crisis, opportunity, or story moment</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">2.</span>
                <span><strong className="text-white">You get one vote per day</strong> to choose how the community responds</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">3.</span>
                <span><strong className="text-white">The majority choice wins</strong> and affects the world's stats</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">4.</span>
                <span><strong className="text-white">The world evolves</strong> based on your collective decisions</span>
              </li>
            </ul>
          </div>

          {/* Win/Lose */}
          <div className="glass-effect-dark rounded-xl p-5">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Stakes
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-red-400">💀</span>
                <span><strong className="text-red-400">Game Over</strong> if Morale or Supplies hit 0, or Threat reaches 100</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">🎉</span>
                <span><strong className="text-green-400">Victory</strong> if you survive long enough with balanced stats</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Pro Tips
            </h3>
            <ul className="text-sm space-y-1.5">
              <li>• <strong>Balance is key</strong> — don't focus on just one stat</li>
              <li>• <strong>Think ahead</strong> — short-term gains can have long-term consequences</li>
              <li>• <strong>Vote daily</strong> — your voice matters in shaping the world</li>
              <li>• <strong>Watch the patterns</strong> — events change based on world conditions</li>
            </ul>
          </div>
        </div>

        {/* Close button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleClose}
            className="glass-effect px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30"
          >
            Let's Begin! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeModal
