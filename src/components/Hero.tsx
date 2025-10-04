export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-4 pt-20 relative overflow-hidden">
      {/* Workflow Pattern Background - Matching n8n.png exactly */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          viewBox="0 0 1200 800"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="workflowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e91e63" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f06292" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Main workflow path - exact pattern from n8n image */}
          <g stroke="url(#workflowGradient)" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Starting horizontal line from bottom-left */}
            <path d="M 100 650 L 300 650" />

            {/* Curve up and right */}
            <path d="M 300 650 Q 350 650 400 600 Q 450 550 550 500" />

            {/* Upper branch path */}
            <path d="M 550 500 Q 650 450 750 350 Q 800 300 900 280" />

            {/* Lower branch path */}
            <path d="M 550 500 Q 650 550 750 580 Q 800 600 900 620" />
          </g>

          {/* Circular nodes - matching n8n style */}
          <g fill="#e91e63">
            {/* Starting node (bottom-left) */}
            <circle cx="100" cy="650" r="24" fill="#e91e63" />
            <circle cx="100" cy="650" r="14" fill="white" />

            {/* Junction node (where path splits) */}
            <circle cx="550" cy="500" r="24" fill="#e91e63" />
            <circle cx="550" cy="500" r="14" fill="white" />

            {/* Upper end node */}
            <circle cx="900" cy="280" r="24" fill="#e91e63" />
            <circle cx="900" cy="280" r="14" fill="white" />

            {/* Lower end node */}
            <circle cx="900" cy="620" r="24" fill="#e91e63" />
            <circle cx="900" cy="620" r="14" fill="white" />
          </g>

          {/* Subtle connecting lines for the intermediate nodes */}
          <g fill="#ec4899">
            <circle cx="300" cy="650" r="16" fill="#ec4899" />
            <circle cx="300" cy="650" r="8" fill="white" />
          </g>

          {/* Animated dots flowing through the workflow */}
          <g fill="#f06292">
            <circle cx="0" cy="0" r="6" fill="#f06292">
              <animateMotion dur="8s" repeatCount="indefinite">
                <path d="M 100 650 L 300 650 Q 350 650 400 600 Q 450 550 550 500 Q 650 450 750 350 Q 800 300 900 280" />
              </animateMotion>
            </circle>
            <circle cx="0" cy="0" r="6" fill="#e91e63">
              <animateMotion dur="8s" repeatCount="indefinite" begin="2s">
                <path d="M 100 650 L 300 650 Q 350 650 400 600 Q 450 550 550 500 Q 650 550 750 580 Q 800 600 900 620" />
              </animateMotion>
            </circle>
            <circle cx="0" cy="0" r="6" fill="#ec4899">
              <animateMotion dur="8s" repeatCount="indefinite" begin="4s">
                <path d="M 100 650 L 300 650 Q 350 650 400 600 Q 450 550 550 500 Q 650 450 750 350 Q 800 300 900 280" />
              </animateMotion>
            </circle>
          </g>
        </svg>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Creative
          <span className="text-indigo-400"> Developer</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Building modern web experiences with cutting-edge technology and innovative design
        </p>

        <a
          href="#projects"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 hover:scale-105 transform relative z-20"
        >
          View My Work
        </a>
      </div>
    </section>
  )
}