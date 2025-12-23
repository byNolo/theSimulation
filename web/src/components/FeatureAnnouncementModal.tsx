import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function FeatureAnnouncementModal() {
  const [announcement, setAnnouncement] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    api.getAnnouncement().then((data) => {
      if (data) {
        const seenKey = `seen_announcement_${data.id}`
        if (!localStorage.getItem(seenKey)) {
          setAnnouncement(data)
          setIsOpen(true)
        }
      }
    }).catch(err => console.error("Failed to fetch announcement", err))
  }, [])

  const handleClose = () => {
    if (announcement) {
      localStorage.setItem(`seen_announcement_${announcement.id}`, 'true')
    }
    setIsOpen(false)
  }

  if (!isOpen || !announcement) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-sky-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                {announcement.title}
              </h2>
              {announcement.version && (
                <span className="text-xs font-mono text-sky-400 bg-sky-900/30 px-2 py-0.5 rounded mt-1 inline-block">
                  {announcement.version}
                </span>
              )}
            </div>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="prose prose-invert max-w-none mb-6 text-gray-300">
            {announcement.html_content ? (
              <div dangerouslySetInnerHTML={{ __html: announcement.html_content }} />
            ) : (
              <p className="whitespace-pre-wrap">{announcement.content}</p>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-sky-900/20"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
