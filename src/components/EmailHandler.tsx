'use client'

import { useState } from 'react'

interface EmailHandlerProps {
  email: string
  subject?: string
  body?: string
  className?: string
  children: React.ReactNode
}

export default function EmailHandler({
  email,
  subject = '',
  body = '',
  className = '',
  children
}: EmailHandlerProps) {
  const [showModal, setShowModal] = useState(false)

  // Web-based email providers with their compose URLs
  const emailProviders = [
    {
      name: 'Gmail',
      domain: 'gmail.com',
      composeUrl: (to: string, sub: string, bod: string) =>
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(sub)}&body=${encodeURIComponent(bod)}`
    },
    {
      name: 'Outlook',
      domain: 'outlook.com',
      composeUrl: (to: string, sub: string, bod: string) =>
        `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(bod)}`
    },
    {
      name: 'Yahoo Mail',
      domain: 'yahoo.com',
      composeUrl: (to: string, sub: string, bod: string) =>
        `https://compose.mail.yahoo.com/?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(bod)}`
    },
    {
      name: 'Apple iCloud',
      domain: 'icloud.com',
      composeUrl: (to: string, sub: string, bod: string) =>
        `https://www.icloud.com/mail/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(bod)}`
    }
  ]

  const handleEmailClick = async (e: React.MouseEvent) => {
    e.preventDefault()

    // Create properly encoded mailto URL
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    try {
      // First, try the standard mailto approach
      window.location.href = mailtoUrl

      // Give it a moment to see if it works
      setTimeout(() => {
        // If we're still here, show options modal
        setShowModal(true)
      }, 1000)

    } catch (error) {
      console.error('Mailto failed:', error)
      // Show options immediately if mailto fails
      setShowModal(true)
    }
  }

  const handleWebEmailClick = (provider: typeof emailProviders[0]) => {
    const url = provider.composeUrl(email, subject, body)
    window.open(url, '_blank', 'noopener,noreferrer')
    setShowModal(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(email)
      alert('Email address copied to clipboard!')
      setShowModal(false)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = email
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Email address copied to clipboard!')
      setShowModal(false)
    }
  }

  return (
    <>
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
        onClick={handleEmailClick}
        className={className}
      >
        {children}
      </a>

      {/* Options Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Send Email</h3>
            <p className="text-gray-300 mb-6">Choose how you'd like to send an email:</p>

            <div className="space-y-3">
              {/* Web Email Providers */}
              {emailProviders.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => handleWebEmailClick(provider)}
                  className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left text-white transition-colors"
                >
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-sm text-gray-400">Open in {provider.name}</div>
                </button>
              ))}

              {/* Copy Email */}
              <button
                onClick={copyToClipboard}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-left text-white transition-colors"
              >
                <div className="font-medium">Copy Email Address</div>
                <div className="text-sm text-blue-200">{email}</div>
              </button>

              {/* Try Default Client Again */}
              <button
                onClick={() => {
                  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                  setShowModal(false)
                }}
                className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left text-white transition-colors"
              >
                <div className="font-medium">Try Default Email Client</div>
                <div className="text-sm text-gray-400">Open in your default email app</div>
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full p-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}