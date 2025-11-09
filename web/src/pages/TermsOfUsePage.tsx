import React from 'react'

const TermsOfUsePage: React.FC = () => {
  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Background effects */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="glass-effect rounded-2xl p-8 space-y-6">
        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Terms of Use
          </h1>
          <p className="text-sm text-gray-400">Last Updated: November 8, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-indigo max-w-none space-y-8 text-gray-300">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using The Simulation ("the Service"), you agree to be bound by these Terms of Use. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p>
              The Simulation is a multiplayer social experiment where users collectively make decisions that affect 
              a persistent virtual world. The Service is provided "as is" for entertainment and educational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-gray-200 mb-3">3.1 Authentication</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users authenticate through third-party OAuth providers (KeyN)</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You must be at least 13 years old to use the Service</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-4">3.2 Account Responsibilities</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>You are responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. User Conduct</h2>
            <h3 className="text-xl font-semibold text-gray-200 mb-3">4.1 Prohibited Activities</h3>
            <p className="mb-2">You may NOT:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Use automated scripts or bots to vote or interact with the Service</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Submit malicious code or attempt to disrupt the Service</li>
              <li>Create multiple accounts to manipulate voting</li>
              <li>Reverse engineer or decompile any portion of the Service</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Voting and Gameplay</h2>
            <h3 className="text-xl font-semibold text-gray-200 mb-3">5.1 Voting Rights</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Each authenticated user may vote once per day per event</li>
              <li>Votes are final and cannot be changed after submission</li>
              <li>The majority/winning choice affects the world state for all users</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-4">5.2 Game Mechanics</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>World statistics (Morale, Supplies, Threat) are shared across all users</li>
              <li>Events and outcomes are determined by algorithms and community votes</li>
              <li>The Service may be reset or modified at any time</li>
              <li>No guarantee of continuous availability or specific outcomes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Content and Intellectual Property</h2>
            <h3 className="text-xl font-semibold text-gray-200 mb-3">6.1 Service Content</h3>
            <p>
              All content provided by the Service (events, interface, code) is owned by the Service operators 
              and protected by copyright.
            </p>

            <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-4">6.2 User-Generated Content</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Admin users may create custom events</li>
              <li>By creating content, you grant the Service a perpetual, worldwide, royalty-free license to use, display, and distribute your content</li>
              <li>You represent that you have the right to submit any content you create</li>
              <li>We reserve the right to remove any user-generated content at our discretion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Disclaimers</h2>
            <div className="glass-effect-dark rounded-xl p-6">
              <h3 className="text-xl font-semibold text-yellow-400 mb-3">7.1 No Warranty</h3>
              <p className="mb-4">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
                BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-semibold text-yellow-400 mb-3">7.2 Limitation of Liability</h3>
              <p>
                IN NO EVENT SHALL THE SERVICE OPERATORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF DATA, LOSS OF PROFITS, 
                OR BUSINESS INTERRUPTION.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time, with or without cause, 
              with or without notice. You may stop using the Service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Use at any time. Changes will be effective 
              immediately upon posting. Your continued use of the Service after changes constitutes 
              acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact Information</h2>
            <p>
              For questions about these Terms of Use, please open an issue on our GitHub repository.
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
            href="/privacy" 
            className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
          >
            Privacy Policy →
          </a>
        </div>
      </div>
    </div>
  )
}

export default TermsOfUsePage
