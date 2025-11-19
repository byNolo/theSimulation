import React from 'react'

type Message = {
    id: number
    day_id: number
    author: string
    avatar: string
    content: string
    sentiment: 'positive' | 'negative' | 'neutral'
    created_at: string
    replies?: Message[]
}

type Props = {
    messages: Message[]
}

const CommunityBoard: React.FC<Props> = ({ messages }) => {
    // Deterministic color based on string
    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    }

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'border-l-4 border-green-500/50'
            case 'negative': return 'border-l-4 border-red-500/50'
            default: return 'border-l-4 border-gray-500/50'
        }
    }

    // Find the max day_id to determine "Today"
    const currentDayId = messages.length > 0 ? Math.max(...messages.map(m => m.day_id)) : 0

    return (
        <div className="glass-effect rounded-xl p-6 w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    Community Voice
                </h2>
                <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded-full">
                    Live Feed
                </span>
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                        {/* Main Message */}
                        <div
                            className={`bg-white/5 rounded-lg p-3 ${getSentimentColor(msg.sentiment)} hover:bg-white/10 transition-colors`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0"
                                    style={{ backgroundColor: stringToColor(msg.avatar) }}
                                >
                                    {msg.author.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-200 truncate">
                                            {msg.author}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {msg.day_id === currentDayId ? 'Today' : `Day ${msg.day_id}`}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Replies */}
                        {msg.replies && msg.replies.length > 0 && (
                            <div className="pl-8 space-y-2 relative">
                                <div className="absolute left-4 top-0 bottom-4 w-0.5 bg-white/10 rounded-full" />
                                {msg.replies.map((reply) => (
                                    <div
                                        key={reply.id}
                                        className="bg-white/5 rounded-lg p-2 ml-2 relative hover:bg-white/10 transition-colors"
                                    >
                                        <div className="absolute -left-6 top-4 w-4 h-0.5 bg-white/10" />
                                        <div className="flex items-start gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shrink-0"
                                                style={{ backgroundColor: stringToColor(reply.avatar) }}
                                            >
                                                {reply.author.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-300 truncate">
                                                        {reply.author}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                                    {reply.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {messages.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No messages yet today.
                    </div>
                )}
            </div>
        </div>
    )
}

export default CommunityBoard
