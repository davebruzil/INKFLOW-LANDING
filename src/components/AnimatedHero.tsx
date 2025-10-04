'use client'

import { useEffect, useState } from 'react'

interface AnimatedHeroProps {
  onViewWorkClick: () => void
}

export default function AnimatedHero({ onViewWorkClick }: AnimatedHeroProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Suppress hydration warnings from browser extensions
    if (typeof window !== 'undefined') {
      const originalError = console.error
      console.error = (...args) => {
        if (typeof args[0] === 'string' && (
          args[0].includes('Hydration') ||
          args[0].includes('hydrated') ||
          args[0].includes('server rendered HTML')
        )) return
        originalError(...args)
      }
    }
  }, [])

  if (!mounted) {
    return (
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-8">
          <div className="space-y-6">
            <h1 className="hero-heading opacity-0">
              Hello, I'm David
            </h1>
            <p className="hero-description mx-auto opacity-0">
              I build AI/ML-powered applications with integrated automation workflows. My work focuses on implementing machine learning solutions that solve real-world problems.
            </p>
          </div>
          <a
            href="#projects"
            className="inline-block bg-white text-black px-8 py-4 rounded-lg font-semibold opacity-0"
          >
            View My Work
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="h-screen relative overflow-hidden">

      {/* Download CV Button - Top Right - Fixed Position */}
      <div className="fixed top-6 right-8 z-50">
        <a
          href="/cv.pdf"
          download="David_Bruzil_CV.pdf"
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors drop-shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download CV
        </a>
      </div>

      {/* Social Links - Top Center - Fixed Position */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/davebruzil?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors drop-shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/david-bruzil-800612253/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors drop-shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&to=davidbruzil@gmail.com&su=Portfolio Contact"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors drop-shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </a>
        </div>
      </div>

      {/* Main Hero Content - Above Lines */}
      <div className="h-screen flex items-center justify-center px-6 relative z-10">
        <div className="text-center space-y-8">
          <div className="space-y-6">
            <h1 className="hero-heading animate-fade-in drop-shadow-sm">
              Hello, I'm David
            </h1>
            <p className="hero-description mx-auto animate-fade-in-delay drop-shadow-sm">
              I build AI/ML-powered applications with integrated automation workflows. My work focuses on implementing machine learning solutions that solve real-world problems.
            </p>
          </div>
          <button
            onClick={onViewWorkClick}
            className="inline-block bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 hover:scale-105 animate-fade-in-delay-2 cursor-pointer shadow-lg"
          >
            View My Work
          </button>
        </div>
      </div>
    </section>
  )
}