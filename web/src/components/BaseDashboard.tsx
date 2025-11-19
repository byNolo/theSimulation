import React, { useState } from 'react'
import api from '../services/api'

interface Project {
    id: number
    name: string
    description: string
    cost: number
    buff_type: string
    buff_value: number
    icon: string
    status: 'available' | 'active' | 'completed'
    votes: number
}

interface ActiveProjectData {
    id: number
    project_id: number
    name: string
    progress: number
    target: number
    percentage: number
}

interface BaseDashboardProps {
    projects: Project[]
    activeProject: ActiveProjectData | null
    completedCount: number
    onVote: (projectId: number) => void
    isAuthenticated: boolean
}

const BaseDashboard: React.FC<BaseDashboardProps> = ({
    projects,
    activeProject,
    completedCount,
    onVote,
    isAuthenticated
}) => {
    const [votingId, setVotingId] = useState<number | null>(null)
    const [showInfo, setShowInfo] = useState(false)

    const handleVote = async (id: number) => {
        if (!isAuthenticated) return
        setVotingId(id)
        try {
            await onVote(id)
        } finally {
            setVotingId(null)
        }
    }

    const completedProjects = projects.filter(p => p.status === 'completed')
    const availableProjects = projects.filter(p => p.status === 'available')

    const getIcon = (icon: string) => {
        // Simple mapping for now, could be replaced with actual SVG components
        switch (icon) {
            case 'leaf': return '🌿'
            case 'radio': return '📡'
            case 'shield': return '🛡️'
            case 'medical': return '⚕️'
            case 'sun': return '☀️'
            default: return '🏗️'
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-blue-400">🏗️</span> Base Command
                    </h2>
                    <button
                        onClick={() => setShowInfo(true)}
                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="How it works"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
                <div className="px-4 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300">
                    Modules Online: {completedCount}
                </div>
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
                    onClick={() => setShowInfo(false)}
                >
                    <div
                        className="glass-effect rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-2xl font-bold text-blue-400">🏗️ Project Rebirth</h2>
                            <button
                                onClick={() => setShowInfo(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-gray-300 mb-6">
                            Rebuild civilization through community-driven construction projects. Vote for priorities, generate production, and unlock permanent upgrades.
                        </p>

                        {/* Current Status */}
                        <div className="glass-effect-dark rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Modules Completed</span>
                                <span className="text-3xl font-bold text-green-400">{completedCount}</span>
                            </div>
                            {activeProject && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                    <div className="text-sm text-gray-400 mb-1">Active Project</div>
                                    <div className="font-semibold text-white">{activeProject.name}</div>
                                    <div className="h-2 bg-black/30 rounded-full overflow-hidden mt-2">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
                                            style={{ width: `${activeProject.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* How It Works */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">How It Works</h3>
                            <div className="space-y-3">
                                <div className="glass-effect-dark rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-blue-400">1. Vote</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Choose which project to build next. Most votes wins. You can change your vote anytime before the day ends.</p>
                                </div>
                                <div className="glass-effect-dark rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-green-400">2. Generate Production</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Your community produces units daily based on Morale and Supplies (10% of each). This automatically goes to the active project.</p>
                                </div>
                                <div className="glass-effect-dark rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-purple-400">3. Complete & Benefit</span>
                                    </div>
                                    <p className="text-sm text-gray-400">When progress reaches the cost, the project completes and provides permanent buffs to your community.</p>
                                </div>
                            </div>
                        </div>

                        {/* Project Phases */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Project Phases</h3>
                            <div className="space-y-3">
                                <div className="glass-effect-dark rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold">Proposal</span>
                                        <span className="font-bold text-yellow-400">Available</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Community can vote on which project to prioritize.</p>
                                </div>
                                <div className="glass-effect-dark rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold">Construction</span>
                                        <span className="font-bold text-blue-400">Active</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Receives daily production until completion. Only one project can be active at a time.</p>
                                </div>
                                <div className="glass-effect-dark rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold">Module Online</span>
                                        <span className="font-bold text-green-400">Completed</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Provides permanent buffs. Cannot be built again.</p>
                                </div>
                            </div>
                        </div>

                        {/* Strategic Tips */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">💡 Strategic Tips</h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-gray-300">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span>Keep Morale and Supplies high to maximize daily production</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-300">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span>Coordinate votes with the community for faster completion</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-300">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span>Early projects that boost Production create a snowball effect</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-300">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span>Balance defensive and economic projects based on current threats</span>
                                </li>
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

            {/* Active Construction */}
            <div className="glass-effect p-6 rounded-xl border border-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                <h3 className="text-lg font-semibold text-blue-200 mb-4">Current Construction</h3>

                {activeProject ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-2xl font-bold text-white">{activeProject.name}</div>
                                <div className="text-sm text-blue-400">Target: {activeProject.target} Production Units</div>
                            </div>
                            <div className="text-3xl font-mono text-blue-300">{activeProject.percentage}%</div>
                        </div>

                        <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 ease-out relative"
                                style={{ width: `${activeProject.percentage}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 text-center">
                            Daily progress depends on community Morale & Supplies
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">💤</div>
                        <div>No active construction. Vote for a project below!</div>
                    </div>
                )}
            </div>

            {/* Completed Modules */}
            {completedProjects.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {completedProjects.map(p => (
                        <div key={p.id} className="glass-effect p-4 rounded-lg border border-green-500/20 flex flex-col items-center text-center">
                            <div className="text-3xl mb-2">{getIcon(p.icon)}</div>
                            <div className="font-bold text-green-100 text-sm">{p.name}</div>
                            <div className="text-xs text-green-400/70 mt-1">Online</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Project Proposals */}
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Project Proposals</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {availableProjects.map(p => (
                        <div key={p.id} className="glass-effect p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-2xl">
                                        {getIcon(p.icon)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white group-hover:text-blue-300 transition-colors">{p.name}</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <span>Cost:</span>
                                            <span className="text-blue-300 font-mono">{p.cost} Units</span>
                                        </div>
                                    </div>
                                </div>
                                {p.votes > 0 && (
                                    <div className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">
                                        {p.votes} votes
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">
                                {p.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                                    Buff: +{p.buff_value} {p.buff_type.replace('_', ' ')}
                                </div>

                                <button
                                    onClick={() => handleVote(p.id)}
                                    disabled={!isAuthenticated || votingId === p.id}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isAuthenticated
                                        ? 'bg-white/10 hover:bg-blue-500/20 hover:text-blue-300 text-white'
                                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {votingId === p.id ? 'Voting...' : 'Vote'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {availableProjects.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-500 italic">
                            {completedProjects.length > 0
                                ? "All projects constructed! You have rebuilt civilization."
                                : "No project proposals available at this time."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BaseDashboard
