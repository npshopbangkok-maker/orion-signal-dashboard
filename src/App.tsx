import { useState } from 'react'
import SignalDashboard from './components/SignalDashboard'
import TradeHistory from './components/TradeHistory'

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'history'>('dashboard')

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Navigation */}
      <nav className="bg-[#0f1724] border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📈 Dashboard
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📊 Trade History
          </button>
        </div>
      </nav>

      {/* Content */}
      {currentView === 'dashboard' ? <SignalDashboard /> : <TradeHistory />}
    </div>
  )
}

export default App
