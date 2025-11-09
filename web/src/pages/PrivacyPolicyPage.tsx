import React from 'react'

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Background effects */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="glass-effect rounded-2xl p-8 space-y-6 custom-scrollbar">
        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400">Last Updated: November 8, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-indigo max-w-none space-y-8 text-gray-300">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p>
              This Privacy Policy explains how The Simulation ("we", "us", or "the Service") collects, uses, 
              and protects your personal information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-200 mb-3">1. Information from OAuth Providers</h3>
            <p className="mb-2">When you authenticate via KeyN, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>User ID:</strong> Unique identifier from the authentication provider</li>
              <li><strong>Display Name:</strong> Your chosen display name</li>
              <li><strong>Username:</strong> Your username (if available)</li>
              <li><strong>Email Address:</strong> Your email (if authorized)</li>
              <li><strong>Profile Information:</strong> Full name, verification status, account creation date (if authorized)</li>
            </ul>
            <p className="mt-3 text-sm text-gray-400">
              ℹ️ We only receive information that you explicitly authorize through the OAuth consent screen.
            </p>

            <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-6">2. Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Session Data:</strong> Session cookies for authentication and preferences</li>
              <li><strong>IP Address:</strong> For security and analytics purposes</li>
              <li><strong>Browser Information:</strong> User agent, browser type, device type</li>
              <li><strong>Timestamps:</strong> When you access the Service and vote</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-6">3. User Activity Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Votes:</strong> Your choices on daily events</li>
              <li><strong>Voting History:</strong> Record of all your votes</li>
              <li><strong>Participation Statistics:</strong> Number of days participated, voting patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <div className="glass-effect-dark rounded-xl p-6 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <div>
                  <strong>Authentication:</strong> Verify your identity and maintain your session
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <div>
                  <strong>Gameplay:</strong> Process your votes and update the world state
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <div>
                  <strong>Personalization:</strong> Display your username and voting history
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <div>
                  <strong>Security:</strong> Detect and prevent fraud, abuse, and unauthorized access
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <div>
                  <strong>Analytics:</strong> Understand usage patterns and improve the Service
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Storage and Security</h2>
            
            <h3 className="text-xl font-semibold text-gray-200 mb-3">Storage</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>All data is stored in a SQLite database on our servers</li>
              <li>Session data is stored server-side with secure session cookies</li>
              <li>OAuth tokens are stored encrypted in server sessions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-4">Security Measures</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>HTTPS:</strong> All communications use SSL/TLS encryption</li>
              <li><strong>OAuth 2.0:</strong> Industry-standard authentication protocol</li>
              <li><strong>Session Security:</strong> Secure, HTTP-only cookies with SameSite protection</li>
              <li><strong>No Password Storage:</strong> We never store passwords; authentication handled by OAuth providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Sharing</h2>
            
            <div className="glass-effect-dark rounded-xl p-6 mb-4">
              <h3 className="text-xl font-semibold text-red-400 mb-3">We Do NOT Share Your Data With:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Third-party advertisers</li>
                <li>Data brokers</li>
                <li>Marketing companies</li>
                <li>Other users (except your display name in-game)</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-200 mb-3">Public Information</h3>
            <p className="mb-2">The following information is visible to all users:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your display name</li>
              <li>Your voting choices (aggregated with others)</li>
              <li>Custom events you create (if you're an admin)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights and Choices</h2>
            
            <h3 className="text-xl font-semibold text-gray-200 mb-3">Access and Correction</h3>
            <p>You can view your voting history through the Service interface (when implemented).</p>

            <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-4">Deletion</h3>
            <p>You may request deletion of your account and associated data by contacting us.</p>

            <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-4">Cookie Management</h3>
            <p>You can clear cookies through your browser settings. Note: Clearing cookies will log you out.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
            <h3 className="text-xl font-semibold text-gray-200 mb-3">OAuth Providers (KeyN)</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>We use KeyN for authentication</li>
              <li>KeyN has its own privacy policy governing their data practices</li>
              <li>We only receive data you authorize through OAuth scopes</li>
              <li>Review KeyN's privacy policy at: <a href="https://auth-keyn.bynolo.ca/privacy" className="text-indigo-400 hover:text-indigo-300">https://auth-keyn.bynolo.ca</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
            <p>
              The Service is not directed to children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected information from 
              a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Breach Notification</h2>
            <p className="mb-2">In the event of a data breach that affects your personal information, we will:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Notify affected users within 72 hours of discovery</li>
              <li>Describe the nature of the breach</li>
              <li>Explain steps we're taking to address it</li>
              <li>Provide recommendations for protecting your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with 
              an updated "Last Updated" date. Your continued use of the Service after changes constitutes 
              acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p>
              For questions, concerns, or requests regarding this Privacy Policy or your personal data, 
              please open an issue on our GitHub repository.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-6 flex justify-between items-center">
          <a 
            href="/" 
            className="glass-effect-dark px-6 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Simulation
          </a>
          <a 
            href="/terms" 
            className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
          >
            Terms of Use →
          </a>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
