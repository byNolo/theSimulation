import React, { useState, useEffect } from 'react'
import api from '../services/api'

interface User {
  id: number
  provider: string
  provider_user_id: string
  display_name: string
  email: string | null
  is_admin: boolean
  created_at: string
  vote_count: number
}

interface UserStats {
  total_users: number
  admin_users: number
  regular_users: number
  provider_breakdown: Record<string, number>
  recent_signups_30d: number
  active_users: number
  inactive_users: number
}

interface UserDetail extends User {
  vote_history: Array<{
    day_id: number
    date: string | null
    option: string
    created_at: string
  }>
  telemetry: Array<{
    event_type: string
    payload: any
    created_at: string
  }>
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [page])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersData, statsData] = await Promise.all([
        api.listUsers(page, 50),
        api.getUserStats()
      ])
      setUsers(usersData.users)
      setTotalPages(usersData.pages)
      setStats(statsData)
    } catch (e: any) {
      setError(e?.error || e?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = async (userId: number) => {
    try {
      const userDetail = await api.getUser(userId)
      setSelectedUser(userDetail)
      setShowUserModal(true)
    } catch (e: any) {
      setError(e?.error || e?.message || 'Failed to load user details')
    }
  }

  const handleToggleAdmin = async (userId: number) => {
    if (!confirm('Are you sure you want to toggle admin status for this user?')) {
      return
    }
    try {
      await api.toggleUserAdmin(userId)
      await loadData()
      if (selectedUser && selectedUser.id === userId) {
        setShowUserModal(false)
        setSelectedUser(null)
      }
      setError(null)
    } catch (e: any) {
      setError(e?.error || e?.message || 'Failed to toggle admin status')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    try {
      await api.deleteUser(userId)
      await loadData()
      if (selectedUser && selectedUser.id === userId) {
        setShowUserModal(false)
        setSelectedUser(null)
      }
      setError(null)
    } catch (e: any) {
      setError(e?.error || e?.message || 'Failed to delete user')
    }
  }

  if (loading && !users.length) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-effect-dark rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Total Users</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {stats.total_users}
            </div>
          </div>
          <div className="glass-effect-dark rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Admin Users</div>
            <div className="text-3xl font-bold text-red-400">
              {stats.admin_users}
            </div>
          </div>
          <div className="glass-effect-dark rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Active Users</div>
            <div className="text-3xl font-bold text-green-400">
              {stats.active_users}
            </div>
          </div>
          <div className="glass-effect-dark rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Recent Signups</div>
            <div className="text-3xl font-bold text-amber-400">
              {stats.recent_signups_30d}
            </div>
            <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="glass-effect-dark rounded-xl p-4 flex items-start gap-3 border border-red-500/30">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      {/* User List */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Management
          </h3>
          <button
            onClick={loadData}
            className="px-4 py-2 glass-effect-dark rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Provider</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Votes</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Joined</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium">{user.display_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">ID: {user.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    {user.email ? (
                      <div className="text-sm text-gray-300">{user.email}</div>
                    ) : (
                      <div className="text-xs text-gray-500 italic">No email</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-lg font-medium">
                      {user.provider}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-300">{user.vote_count}</span>
                  </td>
                  <td className="py-3 px-4">
                    {user.is_admin ? (
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-lg font-medium">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-lg font-medium">
                        User
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="px-3 py-1 bg-indigo-600/50 hover:bg-indigo-600 rounded-lg text-xs transition-colors"
                        title="View Details"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handleToggleAdmin(user.id)}
                        className="px-3 py-1 bg-amber-600/50 hover:bg-amber-600 rounded-lg text-xs transition-colors"
                        title={user.is_admin ? 'Revoke Admin' : 'Make Admin'}
                      >
                        {user.is_admin ? '⬇️' : '⬆️'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-3 py-1 bg-red-600/50 hover:bg-red-600 rounded-lg text-xs transition-colors"
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 glass-effect-dark rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 glass-effect-dark rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedUser.display_name}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>ID: {selectedUser.id}</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg">
                      {selectedUser.provider}
                    </span>
                    {selectedUser.is_admin && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-lg font-medium">
                          Admin
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="glass-effect-dark rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Email</div>
                  <div className="font-medium break-all">
                    {selectedUser.email || <span className="text-gray-500 italic">Not provided</span>}
                  </div>
                </div>
                <div className="glass-effect-dark rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Provider User ID</div>
                  <div className="font-mono text-sm break-all">{selectedUser.provider_user_id}</div>
                </div>
                <div className="glass-effect-dark rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Member Since</div>
                  <div className="font-medium">{new Date(selectedUser.created_at).toLocaleString()}</div>
                </div>
                <div className="glass-effect-dark rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Total Votes</div>
                  <div className="text-2xl font-bold text-indigo-400">{selectedUser.vote_count}</div>
                </div>
                <div className="glass-effect-dark rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Telemetry Events</div>
                  <div className="text-2xl font-bold text-purple-400">{selectedUser.telemetry.length}</div>
                </div>
              </div>

              {/* Voting History */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Recent Votes
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedUser.vote_history.length > 0 ? (
                    selectedUser.vote_history.map((vote, idx) => (
                      <div key={idx} className="glass-effect-dark rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">{vote.option}</div>
                          <div className="text-xs text-gray-500">
                            {vote.date ? `Day: ${vote.date}` : `Day ID: ${vote.day_id}`}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(vote.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="glass-effect-dark rounded-lg p-4 text-center text-gray-500">
                      No voting history
                    </div>
                  )}
                </div>
              </div>

              {/* Telemetry */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Recent Activity
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedUser.telemetry.length > 0 ? (
                    selectedUser.telemetry.map((event, idx) => (
                      <div key={idx} className="glass-effect-dark rounded-lg p-3 font-mono text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-indigo-400">[{event.event_type}]</span>
                          <span className="text-gray-500">{new Date(event.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-gray-300">{JSON.stringify(event.payload)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="glass-effect-dark rounded-lg p-4 text-center text-gray-500">
                      No activity recorded
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleToggleAdmin(selectedUser.id)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {selectedUser.is_admin ? '⬇️ Revoke Admin' : '⬆️ Make Admin'}
                </button>
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  🗑️ Delete User
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-3 glass-effect-dark rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManager
