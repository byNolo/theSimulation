async function fetchJson(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, opts)
  const json = await res.json().catch(() => null)
  if (!res.ok) throw json || new Error('Request failed')
  return json
}

export async function getMe() {
  return fetchJson('/api/me', { credentials: 'include' })
}

export async function getState() {
  return fetchJson('/api/state')
}

export async function getEvent() {
  return fetchJson('/api/event')
}

export async function vote(choice: string) {
  return fetchJson('/api/vote', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ choice }), 
    credentials: 'include' 
  })
}

export async function getTally() {
  return fetchJson('/api/tally', { credentials: 'include' })
}

// Admin endpoints - require authenticated admin user
export async function getMetrics() {
  return fetchJson('/api/admin/metrics', { credentials: 'include' })
}

export async function getHistory() {
  return fetchJson('/api/admin/history', { credentials: 'include' })
}

export async function getTelemetry() {
  return fetchJson('/api/admin/telemetry', { credentials: 'include' })
}

export async function adminTick() {
  return fetchJson('/api/admin/tick', { 
    method: 'POST', 
    credentials: 'include' 
  })
}

// Event management endpoints
export async function listEvents() {
  return fetchJson('/api/admin/events', { credentials: 'include' })
}

export async function createEvent(eventData: any) {
  return fetchJson('/api/admin/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
    credentials: 'include'
  })
}

export async function updateEvent(dbId: number, eventData: any) {
  return fetchJson(`/api/admin/events/${dbId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
    credentials: 'include'
  })
}

export async function deleteEvent(dbId: number) {
  return fetchJson(`/api/admin/events/${dbId}`, {
    method: 'DELETE',
    credentials: 'include'
  })
}

export async function toggleEvent(dbId: number) {
  return fetchJson(`/api/admin/events/${dbId}/toggle`, {
    method: 'POST',
    credentials: 'include'
  })
}

// User management endpoints
export async function listUsers(page = 1, perPage = 50) {
  return fetchJson(`/api/admin/users?page=${page}&per_page=${perPage}`, { 
    credentials: 'include' 
  })
}

export async function getUser(userId: number) {
  return fetchJson(`/api/admin/users/${userId}`, { 
    credentials: 'include' 
  })
}

export async function toggleUserAdmin(userId: number) {
  return fetchJson(`/api/admin/users/${userId}/admin`, {
    method: 'POST',
    credentials: 'include'
  })
}

export async function deleteUser(userId: number) {
  return fetchJson(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include'
  })
}

export async function getUserStats() {
  return fetchJson('/api/admin/users/stats', { 
    credentials: 'include' 
  })
}

export default { 
  getMe, getState, getEvent, vote, getTally, 
  getMetrics, getHistory, getTelemetry, adminTick,
  listEvents, createEvent, updateEvent, deleteEvent, toggleEvent,
  listUsers, getUser, toggleUserAdmin, deleteUser, getUserStats
}
