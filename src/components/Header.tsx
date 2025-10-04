export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Name */}
          <div className="text-2xl font-bold text-white hover:scale-105 transition-transform">
            Portfolio
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-8">
            <a
              href="#home"
              className="text-slate-300 hover:text-indigo-400 transition-colors duration-200"
            >
              Home
            </a>
            <a
              href="#projects"
              className="text-slate-300 hover:text-indigo-400 transition-colors duration-200"
            >
              Projects
            </a>
            <a
              href="#about"
              className="text-slate-300 hover:text-indigo-400 transition-colors duration-200"
            >
              About
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}