import React from 'react'

interface GameOverScreenProps {
    endReason: string | null
    daysSurvived: number
    finalStats: {
        morale: number
        supplies: number
        threat: number
        population: number
    }
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ endReason, daysSurvived, finalStats }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10 bg-black">
                <div className="absolute top-0 left-0 w-full h-full bg-red-900/10 animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-2xl w-full glass-effect rounded-3xl p-12 text-center border border-red-500/30 shadow-2xl shadow-red-900/20 relative z-10">
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/30 animate-bounce-slow">
                    <span className="text-6xl">💀</span>
                </div>

                <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">GAME OVER</h1>
                
                <div className="text-2xl text-red-300 font-medium mb-8">
                    {endReason || "The simulation has ended."}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Days Survived</div>
                        <div className="text-3xl font-bold text-white">{daysSurvived}</div>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Population</div>
                        <div className="text-3xl font-bold text-blue-300">{finalStats.population}</div>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Morale</div>
                        <div className={`text-3xl font-bold ${finalStats.morale <= 0 ? 'text-red-500' : 'text-yellow-300'}`}>
                            {finalStats.morale}%
                        </div>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Supplies</div>
                        <div className={`text-3xl font-bold ${finalStats.supplies <= 0 ? 'text-red-500' : 'text-green-300'}`}>
                            {finalStats.supplies}%
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-300">
                            The simulation has concluded. Please wait for an administrator to archive the results and initialize a new simulation.
                        </p>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                        <a 
                            href="/admin" 
                            className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            Admin Access
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GameOverScreen
