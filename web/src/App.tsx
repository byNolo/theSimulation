import React from 'react'
import Home from './pages/Home'
import AdminPage from './pages/AdminPage'
import TermsOfUsePage from './pages/TermsOfUsePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'

const App: React.FC = () => {
  // Simple route switch based on pathname. Replace with react-router when desired.
  if (location.pathname.startsWith('/admin')) return <AdminPage />
  if (location.pathname === '/terms') return <TermsOfUsePage />
  if (location.pathname === '/privacy') return <PrivacyPolicyPage />
  return <Home />
}

export default App
