'use client'

import { useState, useEffect, useRef } from 'react'
import AnimatedHero from '@/components/AnimatedHero'

export default function Home() {
  const [currentView, setCurrentView] = useState('hero') // 'hero', 'cramcortex', 'inkflow', 'ragsearch'
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false)

  const descriptionRef = useRef<HTMLDivElement>(null)
  const projects = ['cramcortex', 'inkflow', 'ragsearch']
  const currentProjectIndex = projects.indexOf(currentView)

  // Update body class based on current view
  useEffect(() => {
    document.body.className = currentView === 'hero' ? 'hero-view' : 'project-view'
  }, [currentView])

  // Intersection Observer for description section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsDescriptionVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    if (descriptionRef.current) {
      observer.observe(descriptionRef.current)
    }

    return () => {
      if (descriptionRef.current) {
        observer.unobserve(descriptionRef.current)
      }
    }
  }, [currentView])

  const handleViewWorkClick = () => {
    setIsTransitioning(true)
    setIsDescriptionVisible(false) // Reset description visibility

    // First fade out hero
    setTimeout(() => {
      setCurrentView('cramcortex')
    }, 300)

    // Then fade in CramCortex content
    setTimeout(() => {
      setIsTransitioning(false)
    }, 800)
  }

  return (
    <main className={`bg-black text-white ${currentView === 'hero' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Hero Section */}
      {currentView === 'hero' && (
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <AnimatedHero onViewWorkClick={handleViewWorkClick} />
        </div>
      )}

      {/* CramCortex Project */}
      {currentView === 'cramcortex' && (
        <div className={`transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'} min-h-screen`}>
          {/* Hero Image Section */}
          <div className="h-screen relative">
            <video
              src="/projects/cramcortex-demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Bottom Gradient Overlay for Text Readability */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent"></div>

            {/* Navigation Buttons - Top */}
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-10">
              <button
                onClick={() => {
                  setIsTransitioning(true)
                  setIsDescriptionVisible(false)
                  setTimeout(() => {
                    setCurrentView('hero')
                  }, 300)
                  setTimeout(() => {
                    setIsTransitioning(false)
                  }, 800)
                }}
                className="text-white hover:text-gray-300 transition-colors text-left group"
              >
                <div className="text-xs sm:text-sm opacity-60 mb-1">Back to</div>
                <div className="text-base sm:text-xl font-semibold group-hover:-translate-x-1 transition-transform duration-300">
                  ← HOME
                </div>
              </button>
            </div>

            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-10">
              <button
                onClick={() => {
                  setIsTransitioning(true)
                  setIsDescriptionVisible(false)
                  setTimeout(() => {
                    setCurrentView('inkflow')
                  }, 300)
                  setTimeout(() => {
                    setIsTransitioning(false)
                  }, 800)
                }}
                className="text-white hover:text-gray-300 transition-colors text-right group"
              >
                <div className="text-xs sm:text-sm opacity-60 mb-1">Next Project</div>
                <div className="text-base sm:text-xl font-semibold group-hover:translate-x-1 transition-transform duration-300">
                  INKFLOW →
                </div>
              </button>
            </div>

            {/* Project Title and Buttons - Bottom Left */}
            <div className="absolute bottom-8 sm:bottom-12 left-4 sm:left-12 right-4 sm:right-auto z-10 space-y-4 sm:space-y-6">
              <div className="animate-fade-in-delay">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white">
                  CramCortex
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-2">
                  - AI-Powered Test preparation app
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4 animate-fade-in-delay-2">
                <a
                  href="https://github.com/davebruzil/cramcortex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-700 transition-all duration-300 hover:scale-105 border border-gray-600"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.30 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>

            {/* Skills Tags - Bottom Right */}
            <div className="hidden sm:block absolute bottom-20 right-4 sm:right-12 z-10 animate-fade-in-delay-2">
              <div className="flex flex-wrap gap-2 justify-end">
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">Python</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">React</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">FastAPI</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">OpenAI API</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">AI/ML</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">RAG</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">SQLite</span>
              </div>
            </div>

            {/* Scroll Indicator Arrow */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <svg
                className="w-6 h-6 text-white opacity-70 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Description Section - Below the image */}
          <div
            ref={descriptionRef}
            className={`bg-black px-4 sm:px-8 md:px-12 py-12 sm:py-16 transition-all duration-1000 ease-out ${
              isDescriptionVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-4xl space-y-8 sm:space-y-12">
              <p className="text-gray-300 text-xl leading-relaxed">
                Full-stack application that transforms exam documents into structured, interactive study materials using AI analysis and natural language processing.
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-6">How It Works</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-white font-medium">Document Upload:</span>
                      <span className="text-gray-300 ml-2">Users upload PDF exam files through a React frontend with drag-and-drop functionality</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">AI Processing:</span>
                      <span className="text-gray-300 ml-2">FastAPI backend processes documents using OpenAI GPT-4 to extract and classify questions</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Content Analysis:</span>
                      <span className="text-gray-300 ml-2">Questions are automatically categorized by type (multiple choice, true/false, essay) and grouped into semantic topic clusters</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Translation System:</span>
                      <span className="text-gray-300 ml-2">Hebrew-to-English translation with chunked processing and validation ensures English-only output</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Interactive Practice:</span>
                      <span className="text-gray-300 ml-2">Users navigate through questions with progress tracking, explanations, and targeted study modes</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-white mb-6">Technical Implementation</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Frontend Stack:</h4>
                      <ul className="space-y-2 text-gray-300 ml-4">
                        <li>• React 18 + TypeScript for type-safe component development</li>
                        <li>• Vite for fast development and optimized builds</li>
                        <li>• Tailwind CSS with custom dark theme and glassmorphism effects</li>
                        <li>• Responsive design optimized for study workflows</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Backend Architecture:</h4>
                      <ul className="space-y-2 text-gray-300 ml-4">
                        <li>• FastAPI with async/await patterns for concurrent request handling</li>
                        <li>• Python 3.11 with Pydantic for data validation and serialization</li>
                        <li>• OpenAI GPT-4 integration with structured prompts for question extraction</li>
                        <li>• Custom RAG (Retrieval-Augmented Generation) system using sentence-transformers</li>
                        <li>• SQLite database with RESTful API endpoints</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">AI/ML Pipeline:</h4>
                      <ul className="space-y-2 text-gray-300 ml-4">
                        <li>• Document processing with PyPDF2 and OCR capabilities</li>
                        <li>• Semantic text analysis using sentence-transformers for topic clustering</li>
                        <li>• Hebrew translation system with force validation and context awareness</li>
                        <li>• Question classification using GPT-4 with custom cybersecurity knowledge base</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* InkFlow Project */}
      {currentView === 'inkflow' && (
        <div className={`transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'} min-h-screen`}>
          {/* Hero Image Section */}
          <div className="h-screen relative">
            <video
              src="/projects/inkflow-demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover brightness-110"
            />

            {/* Top Gradient Overlay for Navigation Button Visibility */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/95 to-transparent"></div>

            {/* Bottom Gradient Overlay for Text Readability - Netflix-style fade */}
            <div
              className="absolute bottom-0 left-0 right-0 h-full"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, transparent 30%, rgba(0,0,0,0.01) 35%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.54) 70%, rgba(0,0,0,0.68) 75%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.88) 85%, rgba(0,0,0,0.93) 90%, rgba(0,0,0,0.96) 95%, rgba(0,0,0,0.98) 98%, rgba(0,0,0,1) 100%)'
              }}
            ></div>

            {/* Navigation Buttons - Top */}
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-10">
              <button
                onClick={() => {
                  setIsTransitioning(true)
                  setIsDescriptionVisible(false)
                  setTimeout(() => {
                    setCurrentView('cramcortex')
                  }, 300)
                  setTimeout(() => {
                    setIsTransitioning(false)
                  }, 800)
                }}
                className="text-white hover:text-gray-300 transition-colors text-left group"
              >
                <div className="text-xs sm:text-sm opacity-60 mb-1">Previous Project</div>
                <div className="text-base sm:text-xl font-semibold group-hover:-translate-x-1 transition-transform duration-300">
                  ← CRAMCORTEX
                </div>
              </button>
            </div>

            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-10">
              <button
                onClick={() => {
                  setIsTransitioning(true)
                  setIsDescriptionVisible(false)
                  setTimeout(() => {
                    setCurrentView('ragsearch')
                  }, 300)
                  setTimeout(() => {
                    setIsTransitioning(false)
                  }, 800)
                }}
                className="text-white hover:text-gray-300 transition-colors text-right group"
              >
                <div className="text-xs sm:text-sm opacity-60 mb-1">Next Project</div>
                <div className="text-base sm:text-xl font-semibold group-hover:translate-x-1 transition-transform duration-300">
                  RAG SEARCH →
                </div>
              </button>
            </div>

            {/* Project Title and Buttons - Bottom Left */}
            <div className="absolute bottom-8 sm:bottom-12 left-4 sm:left-12 right-4 sm:right-auto z-10 space-y-4 sm:space-y-6">
              <div className="animate-fade-in-delay">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white">
                  InkFlow
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-2">
                  - WhatsApp AI Chatbot for Tattoo Consultations
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4 animate-fade-in-delay-2">
                <a
                  href="https://inkflow.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-200 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Live Demo
                </a>
                <a
                  href="https://github.com/davebruzil/INKFLOW-n8n-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-700 transition-all duration-300 hover:scale-105 border border-gray-600"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.30 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>

            {/* Skills Tags - Bottom Right */}
            <div className="hidden sm:block absolute bottom-20 right-4 sm:right-12 z-10 animate-fade-in-delay-2">
              <div className="flex flex-wrap gap-2 justify-end">
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">n8n</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">GPT-4o</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">WhatsApp API</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">MongoDB</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">Android Dev</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">CRM</span>
              </div>
            </div>

            {/* Scroll Indicator Arrow */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <svg
                className="w-6 h-6 text-white opacity-70 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Description Section - Below the image */}
          <div
            ref={descriptionRef}
            className={`bg-black px-4 sm:px-8 md:px-12 py-12 sm:py-16 transition-all duration-1000 ease-out ${
              isDescriptionVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-4xl space-y-8 sm:space-y-12">
              <p className="text-gray-300 text-xl leading-relaxed">
                This is a WhatsApp chatbot system built for a tattoo artist specializing in realism and fine-line tattoos. The bot acts as a 24/7 virtual assistant that handles initial client consultations, collects tattoo requirements, and automatically generates structured summaries for the artist to review. It has a built-in CRM system to manage all client data and consultation history.
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-6">Core Purpose</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-white font-medium">Consultation Automation:</span>
                      <span className="text-gray-300 ml-2">Automates the initial consultation process for tattoo inquiries</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Information Collection:</span>
                      <span className="text-gray-300 ml-2">Collects essential information: client name, tattoo idea, size, location, style preferences</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Image Analysis:</span>
                      <span className="text-gray-300 ml-2">Handles both text conversations and image analysis for tattoo references</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Seamless Handoff:</span>
                      <span className="text-gray-300 ml-2">Provides seamless handoff to human artist when consultation is complete</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-white mb-6">Key Capabilities</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-white font-medium">Natural Conversations:</span>
                      <span className="text-gray-300 ml-2">Conducts natural Hebrew conversations via WhatsApp</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">AI Vision:</span>
                      <span className="text-gray-300 ml-2">Analyzes tattoo reference images using AI vision</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Context Memory:</span>
                      <span className="text-gray-300 ml-2">Maintains conversation context across multiple message exchanges</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Completion Detection:</span>
                      <span className="text-gray-300 ml-2">Automatically detects when consultations are complete</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Summary Generation:</span>
                      <span className="text-gray-300 ml-2">Generates structured client summaries for artist review</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-white mb-6">Business Value</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-white font-medium">Workload Reduction:</span>
                      <span className="text-gray-300 ml-2">Reduces manual workload for initial client screening</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Consistent Data:</span>
                      <span className="text-gray-300 ml-2">Ensures consistent information collection from all prospects</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">24/7 Availability:</span>
                      <span className="text-gray-300 ml-2">Available 24/7 for immediate client response</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Data Organization:</span>
                      <span className="text-gray-300 ml-2">Organizes client data automatically in database</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-white mb-6">How It Works: Flow</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Message Processing:</h4>
                      <ul className="space-y-2 text-gray-300 ml-4">
                        <li>• WhatsApp webhook receives client messages and forwards to n8n workflow</li>
                        <li>• System extracts phone number, message content, and creates unique session ID</li>
                        <li>• AI status check determines if automated response or human handoff is needed</li>
                        <li>• Message type detection routes to text or image analysis agents</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">AI Agent Processing:</h4>
                      <ul className="space-y-2 text-gray-300 ml-4">
                        <li>• Text Agent uses GPT-4o with Hebrew conversation prompts specialized for tattoo consultations</li>
                        <li>• Image Agent uses GPT-4 with vision to analyze tattoo reference images</li>
                        <li>• Both agents access conversation memory to maintain context across multiple messages</li>
                        <li>• Follows structured consultation flow: greeting → idea discussion → details collection</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Completion & Summary:</h4>
                      <ul className="space-y-2 text-gray-300 ml-4">
                        <li>• System analyzes responses for completion indicators and client name patterns</li>
                        <li>• GPT-4 analyzes full conversation history when consultation is complete</li>
                        <li>• Extracts structured client data and stores consultation summary in MongoDB</li>
                        <li>• Updates conversation memory for future interactions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RAG Search Project */}
      {currentView === 'ragsearch' && (
        <div className={`transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'} min-h-screen`}>
          {/* Hero Image Section */}
          <div className="h-screen relative">
            <video
              src="/projects/ragsearch-demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover brightness-110"
            />

            {/* Top Gradient Overlay for Navigation Button Visibility */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/95 to-transparent"></div>

            {/* Bottom Gradient Overlay for Text Readability - Netflix-style fade */}
            <div
              className="absolute bottom-0 left-0 right-0 h-full"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, transparent 30%, rgba(0,0,0,0.01) 35%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.54) 70%, rgba(0,0,0,0.68) 75%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.88) 85%, rgba(0,0,0,0.93) 90%, rgba(0,0,0,0.96) 95%, rgba(0,0,0,0.98) 98%, rgba(0,0,0,1) 100%)'
              }}
            ></div>

            {/* Navigation Buttons - Top */}
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-10">
              <button
                onClick={() => {
                  setIsTransitioning(true)
                  setIsDescriptionVisible(false)
                  setTimeout(() => {
                    setCurrentView('inkflow')
                  }, 300)
                  setTimeout(() => {
                    setIsTransitioning(false)
                  }, 800)
                }}
                className="text-white hover:text-gray-300 transition-colors text-left group"
              >
                <div className="text-xs sm:text-sm opacity-60 mb-1">Previous Project</div>
                <div className="text-base sm:text-xl font-semibold group-hover:-translate-x-1 transition-transform duration-300">
                  ← INKFLOW
                </div>
              </button>
            </div>

            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-10">
              <button
                onClick={() => {
                  setIsTransitioning(true)
                  setIsDescriptionVisible(false)
                  setTimeout(() => {
                    setCurrentView('hero')
                  }, 300)
                  setTimeout(() => {
                    setIsTransitioning(false)
                  }, 800)
                }}
                className="text-white hover:text-gray-300 transition-colors text-right group"
              >
                <div className="text-xs sm:text-sm opacity-60 mb-1">Back to</div>
                <div className="text-base sm:text-xl font-semibold group-hover:translate-x-1 transition-transform duration-300">
                  HOME →
                </div>
              </button>
            </div>

            {/* Project Title and Buttons - Bottom Left */}
            <div className="absolute bottom-8 sm:bottom-12 left-4 sm:left-12 right-4 sm:right-auto z-10 space-y-4 sm:space-y-6">
              <div className="animate-fade-in-delay">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white">
                  RAG SEARCH
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-2">
                  - Smart search for architects
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4 animate-fade-in-delay-2">
                <a
                  href="https://github.com/davebruzil/smart-search-for-architects-company-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-700 transition-all duration-300 hover:scale-105 border border-gray-600"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.30 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>

            {/* Skills Tags - Bottom Right */}
            <div className="hidden sm:block absolute bottom-20 right-4 sm:right-12 z-10 animate-fade-in-delay-2">
              <div className="flex flex-wrap gap-2 justify-end">
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">Python</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">React</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">OpenAI API</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">Vector DB</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">RAG</span>
                <span className="px-2 sm:px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 backdrop-blur-sm">NLP</span>
              </div>
            </div>

            {/* Scroll Indicator Arrow */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <svg
                className="w-6 h-6 text-white opacity-70 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Description Section - Below the image */}
          <div
            ref={descriptionRef}
            className={`bg-black px-4 sm:px-8 md:px-12 py-12 sm:py-16 transition-all duration-1000 ease-out ${
              isDescriptionVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-4xl space-y-8 sm:space-y-12">
              <p className="text-gray-300 text-xl leading-relaxed">
                A specialized platform designed to help freelance architects discover business opportunities across Israel. The system aggregates and intelligently searches through 600+ Israeli websites from various sectors including hospitals, municipalities, and other organizations, making it easier for architects to find relevant projects and contracts.
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-6">Key Features</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-white font-medium">Multi-Source Aggregation:</span>
                      <span className="text-gray-300 ml-2">Scrapes and monitors 600+ Israeli websites across hospitals, municipalities, and government agencies</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Speech-to-Text Search:</span>
                      <span className="text-gray-300 ml-2">Voice-enabled search functionality for hands-free opportunity discovery</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">RAG-Enhanced Intelligence:</span>
                      <span className="text-gray-300 ml-2">AI-powered search using retrieval-augmented generation for contextual, relevant results</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Automated Data Processing:</span>
                      <span className="text-gray-300 ml-2">Built comprehensive RAG JSON database with scraped company data enhanced by AI analysis</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Opportunity Matching:</span>
                      <span className="text-gray-300 ml-2">Intelligent matching of architectural opportunities with freelancer expertise and preferences</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-white mb-6">Technical Implementation</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-white font-medium">Web Scraping Infrastructure:</span>
                      <span className="text-gray-300 ml-2">Automated scraping system for continuous monitoring of 600+ Israeli institutional websites</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">AI Data Enhancement:</span>
                      <span className="text-gray-300 ml-2">Each scraped company profile is processed and enhanced using AI to extract relevant architectural opportunities</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Voice Interface:</span>
                      <span className="text-gray-300 ml-2">Speech-to-text integration allowing architects to search using voice commands in Hebrew</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">RAG Search Engine:</span>
                      <span className="text-gray-300 ml-2">Vector-based search with contextual understanding for precise opportunity matching</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}