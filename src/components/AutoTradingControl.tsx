import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { topstepxAutoTrader } from '../services/topstepxAutoTrading';

interface TradeInstructions {
  symbol: string;
  direction: string;
  size: number;
  steps: string[];
}

interface AutoTradingControlProps {
  onToggle?: (enabled: boolean) => void;
}

export const AutoTradingControl: React.FC<AutoTradingControlProps> = ({ onToggle }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [config, setConfig] = useState(topstepxAutoTrader.getConfig());
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentInstructions, setCurrentInstructions] = useState<TradeInstructions | null>(null);

  useEffect(() => {
    // Listen for trade instructions
    const handleTradeInstructions = (event: CustomEvent) => {
      setCurrentInstructions(event.detail);
      setShowInstructions(true);
    };

    const handleCloseInstructions = (event: CustomEvent) => {
      setCurrentInstructions({
        symbol: `Close Signal ${event.detail.signalId}`,
        direction: 'CLOSE',
        size: 0,
        steps: event.detail.steps
      });
      setShowInstructions(true);
    };

    window.addEventListener('showTradeInstructions', handleTradeInstructions as EventListener);
    window.addEventListener('showCloseInstructions', handleCloseInstructions as EventListener);

    return () => {
      window.removeEventListener('showTradeInstructions', handleTradeInstructions as EventListener);
      window.removeEventListener('showCloseInstructions', handleCloseInstructions as EventListener);
    };
  }, []);

  const toggleAutoTrading = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    
    if (newState) {
      topstepxAutoTrader.enable();
    } else {
      topstepxAutoTrader.disable();
    }
    
    onToggle?.(newState);
  };

  const updateRiskPercentage = (risk: number) => {
    topstepxAutoTrader.updateConfig({ riskPercentage: risk });
    setConfig(topstepxAutoTrader.getConfig());
  };

  const updateMaxPositions = (max: number) => {
    topstepxAutoTrader.updateConfig({ maxPositions: max });
    setConfig(topstepxAutoTrader.getConfig());
  };

  return (
    <div className="bg-card-bg border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🤖 TopstepX Auto Trading
        </h3>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleAutoTrading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isEnabled 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {isEnabled ? '🟢 ENABLED' : '🔴 DISABLED'}
        </motion.button>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-300 text-sm mb-2">Risk per Trade (%)</label>
          <input
            type="number"
            min="0.1"
            max="5"
            step="0.1"
            value={config.riskPercentage}
            onChange={(e) => updateRiskPercentage(parseFloat(e.target.value))}
            className="w-full bg-dark-bg border border-gray-600 rounded px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-2">Max Positions</label>
          <input
            type="number"
            min="1"
            max="10"
            value={config.maxPositions}
            onChange={(e) => updateMaxPositions(parseInt(e.target.value))}
            className="w-full bg-dark-bg border border-gray-600 rounded px-3 py-2 text-white"
          />
        </div>
      </div>

      {/* Status */}
      <div className="bg-dark-bg/50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-xs">Status</p>
            <p className={`font-medium ${isEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {isEnabled ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Risk Level</p>
            <p className="text-yellow-400 font-medium">{config.riskPercentage}%</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Max Positions</p>
            <p className="text-blue-400 font-medium">{config.maxPositions}</p>
          </div>
        </div>
      </div>

      {/* Hotkeys Reference */}
      <div className="bg-dark-bg/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-300 mb-2">TopstepX Hotkeys</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">New Order:</span>
            <code className="bg-gray-700 px-1 rounded">{config.hotkeys.newOrder}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Buy Market:</span>
            <code className="bg-gray-700 px-1 rounded">{config.hotkeys.buyMarket}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sell Market:</span>
            <code className="bg-gray-700 px-1 rounded">{config.hotkeys.sellMarket}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Close Position:</span>
            <code className="bg-gray-700 px-1 rounded">{config.hotkeys.closePosition}</code>
          </div>
        </div>
      </div>

      {/* Trade Instructions Modal */}
      {showInstructions && currentInstructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInstructions(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card-bg border border-gray-700 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                📋 Trading Instructions
              </h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-dark-bg/50 rounded-lg p-3 mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Symbol:</span>
                  <span className="text-white font-medium">{currentInstructions.symbol}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Direction:</span>
                  <span className={`font-medium ${
                    currentInstructions.direction === 'long' ? 'text-green-400' : 
                    currentInstructions.direction === 'short' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {currentInstructions.direction.toUpperCase()}
                  </span>
                </div>
                {currentInstructions.size > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white font-medium">{currentInstructions.size} lots</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Steps:</h4>
                {currentInstructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 text-sm font-medium min-w-[20px]">
                      {index + 1}.
                    </span>
                    <span className="text-gray-300 text-sm">{step.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Got it! 👍
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
