import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trailingStopManager, TrailingStopUpdate } from '../services/trailingStop';

interface TrailingStopControlProps {
  prices: Record<string, number>;
}

export const TrailingStopControl: React.FC<TrailingStopControlProps> = ({ prices }) => {
  const [config, setConfig] = useState(trailingStopManager.getConfig());
  const [updates, setUpdates] = useState<TrailingStopUpdate[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentUpdate, setCurrentUpdate] = useState<TrailingStopUpdate | null>(null);

  useEffect(() => {
    // Check for trailing stop updates every 5 seconds
    const interval = setInterval(() => {
      if (config.enabled) {
        const newUpdates = trailingStopManager.checkTrailingUpdates(prices);
        if (newUpdates.length > 0) {
          setUpdates(prev => [...prev, ...newUpdates]);
          setCurrentUpdate(newUpdates[0]);
          setShowUpdateModal(true);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [prices, config.enabled]);

  const toggleTrailing = () => {
    const newEnabled = !config.enabled;
    trailingStopManager.updateConfig({ enabled: newEnabled });
    setConfig(trailingStopManager.getConfig());
  };

  const updateTrailMethod = (method: 'swing' | 'atr' | 'fixed_pips') => {
    trailingStopManager.updateConfig({ trailMethod: method });
    setConfig(trailingStopManager.getConfig());
  };

  const updateATRMultiplier = (multiplier: number) => {
    trailingStopManager.updateConfig({ atrMultiplier: multiplier });
    setConfig(trailingStopManager.getConfig());
  };

  const updateFixedPips = (pips: number) => {
    trailingStopManager.updateConfig({ fixedPips: pips });
    setConfig(trailingStopManager.getConfig());
  };

  const acknowledgeUpdate = () => {
    setShowUpdateModal(false);
    setCurrentUpdate(null);
  };

  const dismissAllUpdates = () => {
    setUpdates([]);
    setShowUpdateModal(false);
    setCurrentUpdate(null);
  };

  return (
    <div className="bg-card-bg border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🔄 Trailing Stop Manager
        </h3>
        <div className="flex items-center gap-2">
          {updates.length > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              {updates.length} Updates
            </span>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTrailing}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              config.enabled 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {config.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}
          </motion.button>
        </div>
      </div>

      {/* Trail Method Selection */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm mb-2">Trailing Method</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'swing', label: '📈 Swing', desc: 'Chart patterns' },
            { value: 'atr', label: '📊 ATR', desc: 'Volatility based' },
            { value: 'fixed_pips', label: '📏 Fixed', desc: 'Fixed distance' }
          ].map(method => (
            <button
              key={method.value}
              onClick={() => updateTrailMethod(method.value as any)}
              className={`p-3 rounded-lg border text-sm transition-colors ${
                config.trailMethod === method.value
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-gray-600 bg-dark-bg/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="font-medium">{method.label}</div>
              <div className="text-xs text-gray-400">{method.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Method-specific settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {config.trailMethod === 'atr' && (
          <div>
            <label className="block text-gray-300 text-sm mb-2">ATR Multiplier</label>
            <input
              type="number"
              min="0.5"
              max="5"
              step="0.1"
              value={config.atrMultiplier}
              onChange={(e) => updateATRMultiplier(parseFloat(e.target.value))}
              className="w-full bg-dark-bg border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
        )}
        
        {config.trailMethod === 'fixed_pips' && (
          <div>
            <label className="block text-gray-300 text-sm mb-2">Fixed Pips</label>
            <input
              type="number"
              min="5"
              max="100"
              value={config.fixedPips}
              onChange={(e) => updateFixedPips(parseInt(e.target.value))}
              className="w-full bg-dark-bg border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-dark-bg/50 rounded-lg p-3">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-400">Method</p>
            <p className="text-white font-medium">{config.trailMethod.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-gray-400">Active Trails</p>
            <p className="text-blue-400 font-medium">{trailingStopManager.getActiveTrails().length}</p>
          </div>
          <div>
            <p className="text-gray-400">Pending Updates</p>
            <p className="text-orange-400 font-medium">{updates.length}</p>
          </div>
        </div>
      </div>

      {updates.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-300">Recent Updates</h4>
            <button
              onClick={dismissAllUpdates}
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {updates.slice(-3).map((update, index) => (
              <div key={index} className="bg-orange-500/10 border border-orange-500/20 rounded p-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white">{update.signalId}</span>
                  <span className="text-orange-400">{update.newStopLoss.toFixed(4)}</span>
                </div>
                <p className="text-gray-400 text-xs">{update.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Modal */}
      <AnimatePresence>
        {showUpdateModal && currentUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={acknowledgeUpdate}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card-bg border border-orange-500 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  🔄 Trail Stop Update
                </h3>
                <button
                  onClick={acknowledgeUpdate}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="bg-dark-bg/50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-gray-400">Signal:</span>
                    <p className="text-white font-medium">{currentUpdate.signalId}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">New SL:</span>
                    <p className="text-orange-400 font-medium">{currentUpdate.newStopLoss.toFixed(4)}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-xs">{currentUpdate.reason}</p>
              </div>

              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-300">Manual Steps Required:</h4>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 max-h-48 overflow-y-auto">
                  {currentUpdate.instructions.map((instruction, index) => (
                    <div key={index} className="text-sm text-gray-300 mb-1">
                      {instruction}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={acknowledgeUpdate}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors"
              >
                Got it! 👍
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
