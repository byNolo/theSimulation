import React, { useState, useEffect } from 'react'
import { default as api } from '../services/api'
import Header from '../components/Header'

interface Project {
    id: number
    name: string
    description: string
    cost: number
    buff_type: string
    buff_value: number
    icon: string
    hidden: boolean
    required_project_id: number | null
}

const AdminProjects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<Project | null>(null)
    const [isNew, setIsNew] = useState(false)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            // We need a new API method for admin projects that returns hidden ones too
            // For now, we'll assume getProjects returns all if we are admin, 
            // but actually we defined a specific admin endpoint in the backend plan: GET /api/admin/projects
            // We need to add that to api.ts first or just use fetch here.
            // Let's use fetch for now to avoid circular dependency if I edit api.ts later.
            const res = await fetch('/api/admin/projects')
            if (res.ok) {
                const data = await res.json()
                setProjects(data)
            }
        } catch (e) {
            console.error('Failed to fetch projects', e)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editing) return

        try {
            const url = isNew ? '/api/admin/projects' : `/api/admin/projects/${editing.id}`
            const method = isNew ? 'POST' : 'PUT'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editing)
            })

            if (res.ok) {
                setEditing(null)
                setIsNew(false)
                fetchProjects()
            } else {
                alert('Failed to save project')
            }
        } catch (e) {
            console.error(e)
            alert('Error saving project')
        }
    }

    const toggleHidden = async (project: Project) => {
        try {
            const res = await fetch(`/api/admin/projects/${project.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hidden: !project.hidden })
            })
            if (res.ok) {
                fetchProjects()
            }
        } catch (e) {
            console.error(e)
        }
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Project Management
                            </h2>
                            <p className="text-sm text-gray-400">Create and manage Project Rebirth blueprints</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2 mb-4">
                        <a
                            href="/admin"
                            className="px-6 py-3 rounded-xl font-medium transition-all duration-200 glass-effect-dark hover:bg-white/10 flex items-center gap-2"
                        >
                            📊 Overview
                        </a>
                        <a
                            href="/admin"
                            className="px-6 py-3 rounded-xl font-medium transition-all duration-200 glass-effect-dark hover:bg-white/10 flex items-center gap-2"
                        >
                            👥 Users
                        </a>
                        <a
                            href="/admin"
                            className="px-6 py-3 rounded-xl font-medium transition-all duration-200 glass-effect-dark hover:bg-white/10 flex items-center gap-2"
                        >
                            🎲 Events
                        </a>
                        <div className="px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg flex items-center gap-2">
                            🏗️ Projects
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                setEditing({
                                    id: 0,
                                    name: '',
                                    description: '',
                                    cost: 100,
                                    buff_type: 'supplies',
                                    buff_value: 5,
                                    icon: 'leaf',
                                    hidden: true,
                                    required_project_id: null
                                })
                                setIsNew(true)
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg glow"
                        >
                            ➕ New Project
                        </button>
                        <button
                            onClick={fetchProjects}
                            className="px-6 py-3 glass-effect-dark hover:bg-white/10 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>


                {/* Projects List */}
                <section className="glass-effect rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        All Projects ({projects.length})
                    </h3>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {projects.map(p => (
                                <div key={p.id} className={`glass-effect-dark rounded-xl p-4 hover:bg-white/10 transition-all duration-200 ${p.hidden ? 'opacity-60' : ''}`}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="text-3xl w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center shadow-lg">
                                                {p.icon === 'leaf' ? '🌿' :
                                                    p.icon === 'radio' ? '📡' :
                                                        p.icon === 'shield' ? '🛡️' :
                                                            p.icon === 'medical' ? '⚕️' :
                                                                p.icon === 'sun' ? '☀️' : '🏗️'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-lg flex items-center gap-2 mb-1">
                                                    {p.name}
                                                    {p.hidden && <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded-full">DRAFT</span>}
                                                </div>
                                                <div className="text-sm text-gray-400 mb-2">{p.description}</div>
                                                <div className="flex gap-4 text-xs text-gray-500">
                                                    <span>💰 Cost: {p.cost}</span>
                                                    <span>⚡ Buff: +{p.buff_value} {p.buff_type}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleHidden(p)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${p.hidden
                                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg'
                                                    : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg'
                                                    }`}
                                            >
                                                {p.hidden ? '✓ Publish' : '👁️ Hide'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditing(p)
                                                    setIsNew(false)
                                                }}
                                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                                            >
                                                ✏️ Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Back button */}
                <div className="flex justify-center pt-4">
                    <a
                        href="/admin"
                        className="glass-effect px-6 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Admin Panel
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
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="glass-effect rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{isNew ? 'New Project' : 'Edit Project'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editing.name}
                                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <textarea
                                    value={editing.description}
                                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Cost</label>
                                    <input
                                        type="number"
                                        value={editing.cost}
                                        onChange={e => setEditing({ ...editing, cost: parseInt(e.target.value) })}
                                        className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Icon</label>
                                    <select
                                        value={editing.icon}
                                        onChange={e => setEditing({ ...editing, icon: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
                                    >
                                        <option value="leaf">Leaf</option>
                                        <option value="radio">Radio</option>
                                        <option value="shield">Shield</option>
                                        <option value="medical">Medical</option>
                                        <option value="sun">Sun</option>
                                        <option value="construct">Construct</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Buff Type</label>
                                    <select
                                        value={editing.buff_type}
                                        onChange={e => setEditing({ ...editing, buff_type: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
                                    >
                                        <option value="supplies">Supplies</option>
                                        <option value="morale">Morale</option>
                                        <option value="threat">Threat</option>
                                        <option value="production">Production</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Buff Value</label>
                                    <input
                                        type="number"
                                        value={editing.buff_value}
                                        onChange={e => setEditing({ ...editing, buff_value: parseInt(e.target.value) })}
                                        className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="hidden"
                                    checked={editing.hidden}
                                    onChange={e => setEditing({ ...editing, hidden: e.target.checked })}
                                />
                                <label htmlFor="hidden" className="text-sm text-gray-300">Hidden (Draft)</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditing(null)}
                                    className="px-4 py-2 rounded text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white font-medium"
                                >
                                    Save Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminProjects
