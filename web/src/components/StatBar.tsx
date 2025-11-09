import React, { useState } from 'react'

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const [showInfo, setShowInfo] = useState(false)

  const getIcon = () => {
    switch(label.toLowerCase()) {
      case 'morale':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'supplies':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case 'threat':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      default:
        return null
    }
  }

  const getGlowClass = () => {
    switch(label.toLowerCase()) {
      case 'morale': return 'glow-green'
      case 'supplies': return 'glow-amber'
      case 'threat': return 'glow-red'
      default: return ''
    }
  }

  const getStatInfo = () => {
    const labelLower = label.toLowerCase()
    
    if (labelLower === 'morale') {
      return {
        title: '😊 Community Morale',
        description: 'Represents the overall mental and emotional well-being of your community. High morale keeps people motivated and cooperative.',
        ranges: [
          { range: '0-29', label: 'Critical', effect: 'People are despairing and may give up. Game Over if it reaches 0.', color: 'text-red-400' },
          { range: '30-59', label: 'Moderate', effect: 'Community is struggling but holding together. Watch for declining trends.', color: 'text-yellow-400' },
          { range: '60-100', label: 'Stable', effect: 'People are hopeful and resilient. The community thrives.', color: 'text-green-400' }
        ],
        tips: [
          'Hold celebrations and festivals to boost morale',
          'Preserve culture and education for long-term happiness',
          'Address conflicts quickly before they escalate',
          'Balance survival needs with quality of life'
        ]
      }
    }
    
    if (labelLower === 'supplies') {
      return {
        title: '📦 Supply Stockpile',
        description: 'Food, water, medicine, fuel, and other essential resources. Running out means starvation and suffering.',
        ranges: [
          { range: '0-29', label: 'Critical', effect: 'Severe shortages. People are going hungry. Game Over if it reaches 0.', color: 'text-red-400' },
          { range: '30-59', label: 'Moderate', effect: 'Rationing in effect. Need to gather more soon.', color: 'text-yellow-400' },
          { range: '60-100', label: 'Stable', effect: 'Well-stocked and secure. Can weather emergencies.', color: 'text-green-400' }
        ],
        tips: [
          'Balance gathering with security - sending everyone out increases threat',
          'Trade wisely with caravans when they appear',
          'Sustainable farming provides long-term stability',
          'Stockpile during good times for inevitable crises'
        ]
      }
    }
    
    if (labelLower === 'threat') {
      return {
        title: '⚠️ Threat Level',
        description: 'External dangers: hostile groups, dangerous wildlife, environmental hazards. Lower is safer.',
        ranges: [
          { range: '0-29', label: 'Low', effect: 'Safe and secure. Good time to explore and expand.', color: 'text-green-400' },
          { range: '30-59', label: 'Elevated', effect: 'Some danger present. Stay vigilant and maintain defenses.', color: 'text-yellow-400' },
          { range: '60-100', label: 'Critical', effect: 'Under serious threat. Immediate action required. Game Over if it reaches 100.', color: 'text-red-400' }
        ],
        tips: [
          'Invest in defense systems and fortifications',
          'Avoid revealing your location to outsiders when threat is high',
          'Sometimes hiding is better than fighting',
          'Lockdowns and evacuations can save lives in emergencies'
        ]
      }
    }
    
    return null
  }

  const statInfo = getStatInfo()

  return (
    <>
    <button
      onClick={() => setShowInfo(true)}
      className={`glass-effect rounded-xl p-4 transition-all duration-300 hover:scale-105 ${getGlowClass()} w-full text-left cursor-pointer relative group`}
    >
      {/* Info icon hint */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div style={{ color }} className="opacity-80">
            {getIcon()}
          </div>
          <span className="text-sm font-semibold uppercase tracking-wider text-gray-300">{label}</span>
        </div>
        <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-3 bg-black/30 rounded-full overflow-hidden relative">
        <div 
          className="h-full transition-all duration-700 ease-out rounded-full relative overflow-hidden"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}dd)` }}
        >
          <div className="absolute inset-0 shimmer" />
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 font-medium">
        {label.toLowerCase() === 'threat' ? (
          <>
            {value < 30 && '✓ Low'}
            {value >= 30 && value < 60 && '⚡ Elevated'}
            {value >= 60 && '⚠️ Critical'}
          </>
        ) : (
          <>
            {value < 30 && '⚠️ Critical'}
            {value >= 30 && value < 60 && '⚡ Moderate'}
            {value >= 60 && '✓ Stable'}
          </>
        )}
      </div>
    </button>

    {/* Info Modal */}
    {showInfo && statInfo && (
      <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
        onClick={() => setShowInfo(false)}
      >
        <div 
          className="glass-effect rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold" style={{ color }}>{statInfo.title}</h2>
            <button 
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-300 mb-6">{statInfo.description}</p>

          {/* Current Value */}
          <div className="glass-effect-dark rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Current Level</span>
              <span className="text-3xl font-bold" style={{ color }}>{value}</span>
            </div>
            <div className="h-4 bg-black/30 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-700 rounded-full"
                style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}dd)` }}
              />
            </div>
          </div>

          {/* Ranges */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Status Ranges</h3>
            <div className="space-y-3">
              {statInfo.ranges.map((range, idx) => (
                <div key={idx} className="glass-effect-dark rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{range.range}</span>
                    <span className={`font-bold ${range.color}`}>{range.label}</span>
                  </div>
                  <p className="text-sm text-gray-400">{range.effect}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-lg font-semibold mb-3">💡 Strategic Tips</h3>
            <ul className="space-y-2">
              {statInfo.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => setShowInfo(false)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default StatBar
