import React, { useState, useEffect } from 'react'

type HistoryEntry = {
  day: number
  date: string
  headline: string
  description: string
  options: Array<{ key: string; label: string; description?: string }>
  chosen_option: string
  chosen_option_label: string
  chosen_option_description?: string
  tally: Record<string, number>
  state: {
    morale: number
    supplies: number
    threat: number
    last_event: string
  }
}

const EventHistory: React.FC<{
  history: HistoryEntry[]
  page?: number
  pages?: number
  total?: number
  perPage?: number
  search?: string
  onPageChange?: (p: number) => void
  onSearch?: (term: string) => void
}> = ({ history, page = 1, pages = 1, total = 0, perPage = 30, search = '', onPageChange, onSearch }) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [localSearch, setLocalSearch] = useState(search)
  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  // Debounce live search: call onSearch 400ms after typing stops
  useEffect(() => {
    if (!onSearch) return
    const t = setTimeout(() => {
      // Only trigger if value actually changed
      onSearch(localSearch.trim())
    }, 400)
    return () => clearTimeout(t)
  }, [localSearch, onSearch])

  // Always render the header/search area — if there are no results
  // we'll show a friendly message in the list area below instead

  return (
    <section className="glass-effect rounded-2xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Event History
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{total} past {total === 1 ? 'event' : 'events'}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search history..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && onSearch) onSearch(localSearch.trim())
              }}
              className="px-3 py-2 glass-effect-dark rounded-lg text-sm w-48"
            />
            <button
              onClick={() => onSearch && onSearch(localSearch.trim())}
              className="px-3 py-2 glass-effect-dark rounded-lg text-sm"
            >Search</button>
          </div>
        </div>
      </div>

      {(!history || history.length === 0) ? (
        <div className="p-6 text-gray-400">No past events match your search.</div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => {
          const isExpanded = expandedDay === entry.day
          const totalVotes = Object.values(entry.tally).reduce((sum, val) => sum + val, 0)
          const chosenVotes = entry.tally[entry.chosen_option] || 0
          const chosenPercentage = totalVotes > 0 ? Math.round((chosenVotes / totalVotes) * 100) : 0

          return (
            <div 
              key={entry.day} 
              className="glass-effect-dark rounded-xl overflow-hidden transition-all duration-200"
            >
              {/* Header - always visible */}
              <button
                onClick={() => setExpandedDay(isExpanded ? null : entry.day)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-16 h-16 glass-effect rounded-lg">
                    <span className="text-xs text-gray-400">Day</span>
                    <span className="text-xl font-bold">{entry.day}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{entry.headline}</h3>
                    <p className="text-sm text-gray-400">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Chosen option badge */}
                  <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-lg">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm capitalize">{entry.chosen_option_label}</span>
                    <span className="text-xs text-gray-400">({chosenPercentage}%)</span>
                  </div>
                  
                  {/* Expand/collapse icon */}
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="p-4 pt-0 space-y-4 border-t border-white/10">
                  {/* Event description */}
                  <p className="text-gray-300 text-sm">{entry.description}</p>

                  {/* All options with votes */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-400">Voting Results:</h4>
                    {entry.options.map((opt) => {
                      const votes = entry.tally[opt.key] || 0
                      const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
                      const wasChosen = opt.key === entry.chosen_option

                      return (
                        <div 
                          key={opt.key} 
                          className={`glass-effect p-3 rounded-lg ${wasChosen ? 'ring-2 ring-green-500/50' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {wasChosen && (
                                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              <span className="font-medium capitalize">{opt.label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-400">{votes} {votes === 1 ? 'vote' : 'votes'}</span>
                              <span className="font-bold text-white">{percentage}%</span>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full ${wasChosen ? 'bg-green-500' : 'bg-indigo-500'} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          {opt.description && (
                            <p className="text-xs text-gray-400 mt-2">{opt.description}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Day Summary / Outcome */}
                  {entry.state.last_event && (
                    <div className="glass-effect p-3 rounded-lg border-l-2 border-indigo-500">
                      <div className="text-xs text-indigo-300 mb-1 font-semibold">Outcome Summary</div>
                      <p className="text-sm text-gray-300 italic">"{entry.state.last_event}"</p>
                    </div>
                  )}

                  {/* World state at that time */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass-effect p-3 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Morale</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/5 rounded-full h-2">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${entry.state.morale}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{entry.state.morale}</span>
                      </div>
                    </div>
                    <div className="glass-effect p-3 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Supplies</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/5 rounded-full h-2">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${entry.state.supplies}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{entry.state.supplies}</span>
                      </div>
                    </div>
                    <div className="glass-effect p-3 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Threat</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/5 rounded-full h-2">
                          <div 
                            className="h-full bg-red-500 rounded-full transition-all"
                            style={{ width: `${entry.state.threat}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{entry.state.threat}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
          })}
        </div>
      )}
      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange && onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1 glass-effect-dark rounded"
          >Prev</button>
          <div className="text-sm text-gray-400">Page {page} / {pages}</div>
          <button
            onClick={() => onPageChange && onPageChange(Math.min(pages, page + 1))}
            disabled={page >= pages}
            className="px-3 py-1 glass-effect-dark rounded"
          >Next</button>
        </div>
      )}
    </section>
  )
}

export default EventHistory
