import React from 'react'

type EventOption = {
  key: string
  label: string
  description?: string
}

type EventData = {
  day: number
  headline: string
  description: string
  options: (EventOption | string)[]  // Support both formats
}

const EventCard: React.FC<{ 
  event: EventData; 
  onVote: (opt: string) => void; 
  tally?: Record<string, number>; 
  submitting?: string | null; 
  message?: string | null;
  isAuthenticated?: boolean;
}> = ({ event, onVote, tally = {}, submitting, message, isAuthenticated = false }) => {
  const totalVotes = Object.values(tally).reduce((sum, val) => sum + val, 0)
  
  return (
    <section className="glass-effect rounded-2xl p-8 space-y-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
      
      {/* Day badge */}
      <div className="inline-flex items-center gap-2 glass-effect-dark px-4 py-2 rounded-full text-sm">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">Day {event.day}</span>
      </div>

      {/* Headline */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
          {event.headline}
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed">{event.description}</p>
      </div>

      {/* Voting info */}
      {totalVotes > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} cast</span>
        </div>
      )}

      {/* Options */}
      {!isAuthenticated && (
        <div className="glass-effect-dark rounded-xl p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-semibold">Sign in to vote</span>
          </div>
          <p className="text-sm text-gray-400">You must be signed in to participate in the simulation</p>
          <button
            onClick={() => location.href = '/auth/login'}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg glow"
          >
            Sign in to participate
          </button>
        </div>
      )}

      {isAuthenticated && (
        <div className="grid sm:grid-cols-3 gap-4">
          {event.options.map((opt, idx) => {
            // Support both old string format and new object format
            const optionKey = typeof opt === 'string' ? opt : opt.key
            const optionLabel = typeof opt === 'string' ? opt : opt.label
            const optionDesc = typeof opt === 'object' ? opt.description : null
            
            const votes = tally[optionKey] || 0
            const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
            const isSubmitting = submitting === optionKey
            const gradients = [
              'from-blue-600 to-indigo-600',
              'from-purple-600 to-pink-600',
              'from-amber-600 to-orange-600'
            ]
            
            return (
              <button
                key={optionKey}
                disabled={!!submitting}
                onClick={() => onVote(optionKey)}
                className={`glass-effect-dark hover:bg-white/15 active:scale-95 transition-all duration-200 rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden group ${
                  isSubmitting ? 'animate-pulse' : ''
                }`}
              >
                {/* Progress bar background */}
                {totalVotes > 0 && (
                  <div 
                    className={`absolute inset-0 bg-gradient-to-r ${gradients[idx % gradients.length]} opacity-10 transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                )}
                
                <div className="relative z-10 flex flex-col gap-2">
                  {/* Option text */}
                  <span className="font-semibold text-lg capitalize text-left group-hover:text-white transition-colors">
                    {optionLabel}
                  </span>
                  
                  {/* Option description */}
                  {optionDesc && (
                    <p className="text-xs text-gray-400 text-left leading-relaxed">
                      {optionDesc}
                    </p>
                  )}
                  
                  {/* Vote stats */}
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-400">
                      {votes} {votes === 1 ? 'vote' : 'votes'}
                    </span>
                    {totalVotes > 0 && (
                      <span className={`font-bold bg-gradient-to-r ${gradients[idx % gradients.length]} bg-clip-text text-transparent`}>
                        {percentage}%
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            )
          })}
        </div>
      )}

      {/* Message feedback */}
      {message && (
        <div className="glass-effect-dark rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-green-300 font-medium">{message}</span>
        </div>
      )}
    </section>
  )
}

export default EventCard
