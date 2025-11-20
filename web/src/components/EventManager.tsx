import React, { useState, useEffect } from 'react'
import api from '../services/api'

type EventOption = {
  key: string
  label: string
  description?: string
  deltas: {
    morale: number
    supplies: number
    threat: number
  }
}

type EventData = {
  id: string
  db_id?: number
  headline: string
  description: string
  category: string
  weight: number
  min_morale: number
  max_morale: number
  min_supplies: number
  max_supplies: number
  min_threat: number
  max_threat: number
  requires_day: number
  options: EventOption[]
  is_builtin: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

type CategorySummary = {
  category: string
  avgMorale: number
  avgSupplies: number
  avgThreat: number
  eventCount: number
}

function computeEventBalance(
  events: { builtin: EventData[]; custom: EventData[] } | null
): CategorySummary[] {
  if (!events) return []

  const all = [...events.builtin, ...events.custom]
  const byCat: Record<string, { m: number; s: number; t: number; count: number }> = {}

  all.forEach(ev => {
    if (!byCat[ev.category]) {
      byCat[ev.category] = { m: 0, s: 0, t: 0, count: 0 }
    }

    // average deltas across options in this event
    let mSum = 0
    let sSum = 0
    let tSum = 0
    const k = ev.options.length || 1

    ev.options.forEach(opt => {
      mSum += opt.deltas.morale
      sSum += opt.deltas.supplies
      tSum += opt.deltas.threat
    })

    byCat[ev.category].m += mSum / k
    byCat[ev.category].s += sSum / k
    byCat[ev.category].t += tSum / k
    byCat[ev.category].count += 1
  })

  return Object.entries(byCat).map(([category, v]) => ({
    category,
    avgMorale: v.m / v.count,
    avgSupplies: v.s / v.count,
    avgThreat: v.t / v.count,
    eventCount: v.count,
  }))
}


const EventManager: React.FC = () => {
  const [events, setEvents] = useState<{ builtin: EventData[], custom: EventData[], total: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null)
  const [viewFilter, setViewFilter] = useState<'all' | 'builtin' | 'custom'>('all')

  useEffect(() => {
    loadEvents()
  }, [])

  const categorySummaries = computeEventBalance(events)

  const loadEvents = async () => {
    try {
      const data = await api.listEvents()
      setEvents(data)
      setMsg(null)
    } catch (e: any) {
      setMsg(e?.error || e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (dbId: number) => {
    try {
      await api.toggleEvent(dbId)
      await loadEvents()
      setMsg('Event toggled successfully')
    } catch (e: any) {
      setMsg(e?.error || e?.message || String(e))
    }
  }

  const handleDelete = async (dbId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      await api.deleteEvent(dbId)
      await loadEvents()
      setMsg('Event deleted successfully')
    } catch (e: any) {
      setMsg(e?.error || e?.message || String(e))
    }
  }

  const filteredEvents = () => {
    if (!events) return []
    if (viewFilter === 'builtin') return events.builtin
    if (viewFilter === 'custom') return events.custom
    return [...events.builtin, ...events.custom]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event Manager</h2>
          <p className="text-sm text-gray-400">
            {events?.total || 0} total events ({events?.builtin.length || 0} built-in, {events?.custom.length || 0} custom)
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
        >
          + Create Event
        </button>
      </div>

      {/* Category Balance Snapshot */}
      {events && categorySummaries.length > 0 && (
        <div className="glass-effect-dark rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Category Balance Snapshot
          </h3>
          <div className="grid md:grid-cols-4 gap-3 text-xs">
            {categorySummaries.map(cat => (
              <div key={cat.category} className="bg-black/40 rounded-lg p-3">
                <div className="font-semibold text-white mb-1 capitalize">
                  {cat.category} <span className="text-gray-400">({cat.eventCount})</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>M:</span>
                  <span className={cat.avgMorale > 0 ? 'text-green-400' : cat.avgMorale < 0 ? 'text-red-400' : 'text-gray-300'}>
                    {cat.avgMorale.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>S:</span>
                  <span className={cat.avgSupplies > 0 ? 'text-green-400' : cat.avgSupplies < 0 ? 'text-red-400' : 'text-gray-300'}>
                    {cat.avgSupplies.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>T:</span>
                  <span className={cat.avgThreat > 0 ? 'text-red-400' : cat.avgThreat < 0 ? 'text-green-400' : 'text-gray-300'}>
                    {cat.avgThreat.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'builtin', 'custom'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setViewFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewFilter === filter
                ? 'bg-indigo-600 text-white'
                : 'glass-effect-dark hover:bg-white/10'
            }`}
          >
            {filter === 'all' ? 'All Events' : filter === 'builtin' ? 'Built-in' : 'Custom'}
          </button>
        ))}
      </div>

      {msg && (
        <div className="glass-effect-dark rounded-xl p-4 text-sm text-yellow-300">
          {msg}
        </div>
      )}

      {/* Event List */}
      <div className="space-y-3">
        {filteredEvents().map(event => (
          <EventCard
            key={event.id}
            event={event}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={setEditingEvent}
          />
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateForm || editingEvent) && (
        <EventForm
          event={editingEvent}
          onClose={() => {
            setShowCreateForm(false)
            setEditingEvent(null)
          }}
          onSuccess={async () => {
            await loadEvents()
            setShowCreateForm(false)
            setEditingEvent(null)
            setMsg('Event saved successfully')
          }}
        />
      )}
    </div>
  )
}

const EventCard: React.FC<{
  event: EventData
  onToggle: (dbId: number) => void
  onDelete: (dbId: number) => void
  onEdit: (event: EventData) => void
}> = ({ event, onToggle, onDelete, onEdit }) => {
  const [expanded, setExpanded] = useState(false)

  const categoryColors = {
    crisis: 'from-red-600 to-orange-600',
    opportunity: 'from-green-600 to-emerald-600',
    narrative: 'from-purple-600 to-pink-600',
    general: 'from-blue-600 to-indigo-600'
  }

  return (
    <div className="glass-effect rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${categoryColors[event.category as keyof typeof categoryColors]} text-white`}>
              {event.category}
            </span>
            {event.is_builtin && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                Built-in
              </span>
            )}
            {!event.is_active && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-900 text-red-300">
                Inactive
              </span>
            )}
            <span className="text-xs text-gray-500">Weight: {event.weight}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-1">{event.headline}</h3>
          <p className="text-sm text-gray-400 mb-3">{event.description}</p>
          
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span>Morale: {event.min_morale}-{event.max_morale}</span>
            <span>•</span>
            <span>Supplies: {event.min_supplies}-{event.max_supplies}</span>
            <span>•</span>
            <span>Threat: {event.min_threat}-{event.max_threat}</span>
            {event.requires_day > 0 && (
              <>
                <span>•</span>
                <span>Day {event.requires_day}+</span>
              </>
            )}
          </div>

          {expanded && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-semibold text-gray-300">Options:</div>
              {event.options.map(opt => (
                <div key={opt.key} className="glass-effect-dark rounded-lg p-3">
                  <div className="font-medium">{opt.label}</div>
                  {opt.description && (
                    <div className="text-xs text-gray-400 mt-1">{opt.description}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-2 flex gap-3">
                    <span className={opt.deltas.morale >= 0 ? 'text-green-400' : 'text-red-400'}>
                      Morale {opt.deltas.morale > 0 ? '+' : ''}{opt.deltas.morale}
                    </span>
                    <span className={opt.deltas.supplies >= 0 ? 'text-green-400' : 'text-red-400'}>
                      Supplies {opt.deltas.supplies > 0 ? '+' : ''}{opt.deltas.supplies}
                    </span>
                    <span className={opt.deltas.threat >= 0 ? 'text-red-400' : 'text-green-400'}>
                      Threat {opt.deltas.threat > 0 ? '+' : ''}{opt.deltas.threat}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1 glass-effect-dark rounded-lg text-xs hover:bg-white/10 transition-colors"
          >
            {expanded ? 'Hide' : 'Show'} Details
          </button>
          {!event.is_builtin && event.db_id && (
            <>
              <button
                onClick={() => onEdit(event)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onToggle(event.db_id!)}
                className={`px-3 py-1 ${event.is_active ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'} rounded-lg text-xs transition-colors`}
              >
                {event.is_active ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => onDelete(event.db_id!)}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-xs transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const EventForm: React.FC<{
  event: EventData | null
  onClose: () => void
  onSuccess: () => void
}> = ({ event, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    event_id: event?.id || '',
    headline: event?.headline || '',
    description: event?.description || '',
    category: event?.category || 'general',
    weight: event?.weight || 1,
    min_morale: event?.min_morale || 0,
    max_morale: event?.max_morale || 100,
    min_supplies: event?.min_supplies || 0,
    max_supplies: event?.max_supplies || 100,
    min_threat: event?.min_threat || 0,
    max_threat: event?.max_threat || 100,
    requires_day: event?.requires_day || 0,
    options: event?.options || [
      { key: '', label: '', description: '', deltas: { morale: 0, supplies: 0, threat: 0 } },
      { key: '', label: '', description: '', deltas: { morale: 0, supplies: 0, threat: 0 } },
      { key: '', label: '', description: '', deltas: { morale: 0, supplies: 0, threat: 0 } }
    ]
  })
  const [msg, setMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation to avoid losing user input on simple mistakes
    const validateForm = () => {
      if (!formData.event_id || formData.event_id.trim() === '') return 'Event ID is required.'
      if (!formData.headline || formData.headline.trim() === '') return 'Headline is required.'
      if (!formData.description || formData.description.trim() === '') return 'Description is required.'
      if (!Array.isArray(formData.options) || formData.options.length < 2) return 'At least 2 options are required.'

      const seenKeys = new Set<string>()
      for (let i = 0; i < formData.options.length; i++) {
        const opt = formData.options[i]
        if (!opt.key || String(opt.key).trim() === '') return `Option ${i + 1}: key is required.`
        if (!opt.label || String(opt.label).trim() === '') return `Option ${i + 1}: label is required.`
        if (seenKeys.has(opt.key)) return `Duplicate option key: "${opt.key}". Keys must be unique within this event.`
        seenKeys.add(opt.key)

        const d = opt.deltas || {}
        if (d.morale === undefined || d.supplies === undefined || d.threat === undefined) return `Option ${i + 1}: deltas for morale, supplies, and threat are required.`
        if (isNaN(Number(d.morale)) || isNaN(Number(d.supplies)) || isNaN(Number(d.threat))) return `Option ${i + 1}: deltas must be numbers.`
      }

      return null
    }

    const validationError = validateForm()
    if (validationError) {
      setMsg(validationError)
      return
    }

    setSubmitting(true)
    setMsg(null)

    try {
      if (event?.db_id) {
        await api.updateEvent(event.db_id, formData)
      } else {
        await api.createEvent(formData)
      }
      onSuccess()
    } catch (e: any) {
      // Keep form data intact; show server-side message if provided
      setMsg(e?.error || e?.message || String(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start md:items-center justify-center z-50 overflow-y-auto px-6">
      <div className="glass-effect rounded-2xl p-8 max-w-4xl w-full m-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
        <h2 className="text-2xl font-bold mb-6">{event ? 'Edit Event' : 'Create New Event'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event ID *</label>
              <input
                type="text"
                value={formData.event_id}
                onChange={e => setFormData({...formData, event_id: e.target.value})}
                className="w-full px-4 py-2 glass-effect-dark rounded-lg"
                required
                disabled={!!event}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 glass-effect-dark rounded-lg text-gray-100 bg-black/60 appearance-none pr-8"
              >
                <option value="general">General</option>
                <option value="crisis">Crisis</option>
                <option value="opportunity">Opportunity</option>
                <option value="narrative">Narrative</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Headline *</label>
            <input
              type="text"
              value={formData.headline}
              onChange={e => setFormData({...formData, headline: e.target.value})}
              className="w-full px-4 py-2 glass-effect-dark rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 glass-effect-dark rounded-lg h-24"
              required
            />
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Weight</label>
              <input
                type="number"
                value={formData.weight}
                onChange={e => setFormData({...formData, weight: parseInt(e.target.value)})}
                className="w-full px-4 py-2 glass-effect-dark rounded-lg"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Requires Day</label>
              <input
                type="number"
                value={formData.requires_day}
                onChange={e => setFormData({...formData, requires_day: parseInt(e.target.value)})}
                className="w-full px-4 py-2 glass-effect-dark rounded-lg"
                min="0"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Morale Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.min_morale}
                  onChange={e => setFormData({...formData, min_morale: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 glass-effect-dark rounded-lg"
                  min="0"
                  max="100"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={formData.max_morale}
                  onChange={e => setFormData({...formData, max_morale: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 glass-effect-dark rounded-lg"
                  min="0"
                  max="100"
                  placeholder="Max"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Supplies Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.min_supplies}
                  onChange={e => setFormData({...formData, min_supplies: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 glass-effect-dark rounded-lg"
                  min="0"
                  max="100"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={formData.max_supplies}
                  onChange={e => setFormData({...formData, max_supplies: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 glass-effect-dark rounded-lg"
                  min="0"
                  max="100"
                  placeholder="Max"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Threat Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.min_threat}
                  onChange={e => setFormData({...formData, min_threat: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 glass-effect-dark rounded-lg"
                  min="0"
                  max="100"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={formData.max_threat}
                  onChange={e => setFormData({...formData, max_threat: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 glass-effect-dark rounded-lg"
                  min="0"
                  max="100"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium mb-2">Options * (at least 2)</label>
            {formData.options.map((opt, idx) => {
              const score = opt.deltas.morale + opt.deltas.supplies - opt.deltas.threat

              return (
              <div key={idx} className="glass-effect-dark rounded-lg p-4 mb-3">
                <div className="grid md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={opt.key}
                  onChange={e => {
                  const newOptions = [...formData.options]
                  newOptions[idx].key = e.target.value
                  setFormData({...formData, options: newOptions})
                  }}
                  placeholder="Option key (e.g., fortify)"
                  className="px-3 py-2 bg-black/30 rounded"
                  required
                />
                <input
                  type="text"
                  value={opt.label}
                  onChange={e => {
                  const newOptions = [...formData.options]
                  newOptions[idx].label = e.target.value
                  setFormData({...formData, options: newOptions})
                  }}
                  placeholder="Display label (e.g., Fortify Defenses)"
                  className="px-3 py-2 bg-black/30 rounded"
                  required
                />
                </div>
                <input
                type="text"
                value={opt.description}
                onChange={e => {
                  const newOptions = [...formData.options]
                  newOptions[idx].description = e.target.value
                  setFormData({...formData, options: newOptions})
                }}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 bg-black/30 rounded mb-3"
                />
                <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  value={opt.deltas.morale}
                  onChange={e => {
                  const newOptions = [...formData.options]
                  newOptions[idx].deltas.morale = parseInt(e.target.value)
                  setFormData({...formData, options: newOptions})
                  }}
                  placeholder="Morale Δ"
                  className="px-3 py-2 bg-black/30 rounded"
                  required
                />
                <input
                  type="number"
                  value={opt.deltas.supplies}
                  onChange={e => {
                  const newOptions = [...formData.options]
                  newOptions[idx].deltas.supplies = parseInt(e.target.value)
                  setFormData({...formData, options: newOptions})
                  }}
                  placeholder="Supplies Δ"
                  className="px-3 py-2 bg-black/30 rounded"
                  required
                />
                <input
                  type="number"
                  value={opt.deltas.threat}
                  onChange={e => {
                  const newOptions = [...formData.options]
                  newOptions[idx].deltas.threat = parseInt(e.target.value)
                  setFormData({...formData, options: newOptions})
                  }}
                  placeholder="Threat Δ"
                  className="px-3 py-2 bg-black/30 rounded"
                  required
                />
                </div>

                <div className="mt-2 text-xs text-gray-400">
                Option balance score:{' '}
                <span className={score >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {score}
                </span>
                <span className="text-gray-500 ml-1">
                  (morale + supplies − threat)
                </span>
                </div>
              </div>
              )
            })}
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                options: [...formData.options, { key: '', label: '', description: '', deltas: { morale: 0, supplies: 0, threat: 0 } }]
              })}
              className="glass-effect-dark px-4 py-2 rounded-lg text-sm hover:bg-white/10"
            >
              + Add Option
            </button>
          </div>

          {msg && (
            <div className="text-sm text-red-400">{msg}</div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 glass-effect-dark rounded-xl hover:bg-white/10"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-medium"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventManager
