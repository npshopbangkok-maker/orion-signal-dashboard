import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignalCard from './SignalCard';
import PriceTicker from './PriceTicker';
import MarketStatus from './MarketStatus';
import { AutoTradingControl } from './AutoTradingControl';
import { TrailingStopControl } from './TrailingStopControl';
import { useSignalWebSocket } from '../hooks/useSignalWebSocket';
import { Signal, KillzoneFilter, SymbolFilter } from '../types/signal';
import { playNotificationSound, sendTelegramNotification, sendLineNotification } from '../utils/signalUtils';

const SignalDashboard: React.FC = () => {
  // Environment variables
  const wsUrl = import.meta.env.VITE_SIGNAL_WS_URL;
  const telegramWebhook = import.meta.env.VITE_TELEGRAM_WEBHOOK;
  const lineToken = import.meta.env.VITE_LINE_TOKEN;

  // WebSocket hook
  const { signals, prices, connectionStatus, error, reconnect } = useSignalWebSocket(wsUrl);

  // Filter states
  const [killzoneFilter, setKillzoneFilter] = useState<KillzoneFilter>('all');
  const [symbolFilter, setSymbolFilter] = useState<SymbolFilter>('all');
  const [showConfirmedOnly, setShowConfirmedOnly] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Track previous signals to detect new confirmed signals
  const [prevSignals, setPrevSignals] = useState<Signal[]>([]);

  // Detect new confirmed signals for notifications
  useEffect(() => {
    const newConfirmedSignals = signals.filter(signal => 
      signal.status === 'confirmed' && 
      !prevSignals.find(prev => prev.id === signal.id && prev.status === 'confirmed')
    );

    newConfirmedSignals.forEach(signal => {
      // Play sound
      playNotificationSound();
      
      // Send Telegram notification
      if (telegramWebhook) {
        sendTelegramNotification(signal, telegramWebhook);
      }

      // Send LINE notification
      if (lineToken) {
        sendLineNotification(signal, lineToken);
      }
    });

    setPrevSignals(signals);
  }, [signals, telegramWebhook]);

  // Filter signals
  const filteredSignals = useMemo(() => {
    return signals.filter(signal => {
      if (showConfirmedOnly && signal.status !== 'confirmed') return false;
      if (killzoneFilter !== 'all' && signal.killzone !== killzoneFilter) return false;
      if (symbolFilter !== 'all' && signal.symbol !== symbolFilter) return false;
      return true;
    });
  }, [signals, killzoneFilter, symbolFilter, showConfirmedOnly]);

  // Group signals by status
  const signalsByStatus = useMemo(() => {
    const pending = filteredSignals.filter(s => s.status === 'pending');
    const confirmed = filteredSignals.filter(s => s.status === 'confirmed');
    const invalidated = filteredSignals.filter(s => s.status === 'invalidated');
    
    return { pending, confirmed, invalidated };
  }, [filteredSignals]);

  // Handle copy functionality
  const handleCopySignal = (signal: Signal) => {
    setCopyFeedback(`Copied: ${signal.symbol} ${signal.direction.toUpperCase()}`);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return wsUrl ? 'WebSocket Connected' : 'Demo Mode Active';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  // Check if market is open (simple approximation)
  const isMarketOpen = useMemo(() => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const et = new Date(utc + (-5 * 3600000)); // EST/EDT
    const hour = et.getHours();
    const minute = et.getMinutes();
    const currentTime = hour * 60 + minute;
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    return currentTime >= marketOpen && currentTime < marketClose;
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 space-y-4 md:space-y-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white">ORION Signal Dashboard</h1>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              {/* Market Status - Mobile */}
              <MarketStatus className="md:hidden" />
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}></div>
                <span className="text-sm text-gray-300">{getConnectionStatusText()}</span>
                {connectionStatus === 'disconnected' && (
                  <button
                    onClick={reconnect}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Reconnect
                  </button>
                )}
                {error && (
                  <span className="text-xs text-yellow-400 ml-2">
                    {error}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price Ticker */}
          <PriceTicker prices={prices} isMarketOpen={isMarketOpen} />

          {/* Auto Trading Control */}
          <AutoTradingControl 
            onToggle={(enabled) => {
              console.log(`Auto trading ${enabled ? 'enabled' : 'disabled'}`);
            }}
          />

          {/* Trailing Stop Control */}
          <TrailingStopControl prices={Object.fromEntries(
            Object.entries(prices).map(([symbol, data]) => [symbol, data.price])
          )} />

          {/* Filters */}
          <div className="bg-card-bg rounded-2xl p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Killzone Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Killzone</label>
                <select
                  value={killzoneFilter}
                  onChange={(e) => setKillzoneFilter(e.target.value as KillzoneFilter)}
                  className="w-full bg-dark-bg border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Killzones</option>
                  <option value="asia">Asia</option>
                  <option value="london">London</option>
                  <option value="ny_am">NY AM</option>
                  <option value="lunch">Lunch</option>
                  <option value="pm">PM</option>
                </select>
              </div>

              {/* Symbol Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
                <select
                  value={symbolFilter}
                  onChange={(e) => setSymbolFilter(e.target.value as SymbolFilter)}
                  className="w-full bg-dark-bg border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Symbols</option>
                  <option value="MNQ">MNQ</option>
                  <option value="NQ">NQ</option>
                  <option value="MES">MES</option>
                </select>
              </div>

              {/* Confirmed Only Toggle */}
              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showConfirmedOnly}
                    onChange={(e) => setShowConfirmedOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-dark-bg border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Confirmed Only</span>
                </label>
              </div>

              {/* Stats & Market Status */}
              <div className="flex md:flex-col items-center md:items-end justify-between">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Total Signals</div>
                  <div className="text-xl font-bold text-white">{filteredSignals.length}</div>
                </div>
                {/* Market Status - Desktop */}
                <MarketStatus className="hidden md:block mt-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Copy Feedback */}
        <AnimatePresence>
          {copyFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
            >
              {copyFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Signal Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Pending Signals */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg md:text-xl font-semibold text-pending">Pending</h2>
              <span className="bg-pending/20 text-pending px-2 py-1 rounded-lg text-sm font-medium">
                {signalsByStatus.pending.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[calc(100vh-400px)] md:max-h-[calc(100vh-350px)] overflow-y-auto">
              <AnimatePresence>
                {signalsByStatus.pending.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    onCopy={handleCopySignal}
                  />
                ))}
              </AnimatePresence>
              {signalsByStatus.pending.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No pending signals
                </div>
              )}
            </div>
          </div>

          {/* Confirmed Signals */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg md:text-xl font-semibold text-confirmed">Confirmed</h2>
              <span className="bg-confirmed/20 text-confirmed px-2 py-1 rounded-lg text-sm font-medium">
                {signalsByStatus.confirmed.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[calc(100vh-400px)] md:max-h-[calc(100vh-350px)] overflow-y-auto">
              <AnimatePresence>
                {signalsByStatus.confirmed.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    onCopy={handleCopySignal}
                  />
                ))}
              </AnimatePresence>
              {signalsByStatus.confirmed.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No confirmed signals
                </div>
              )}
            </div>
          </div>

          {/* Invalidated Signals */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg md:text-xl font-semibold text-invalidated">Invalidated</h2>
              <span className="bg-invalidated/20 text-invalidated px-2 py-1 rounded-lg text-sm font-medium">
                {signalsByStatus.invalidated.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[calc(100vh-400px)] md:max-h-[calc(100vh-350px)] overflow-y-auto">
              <AnimatePresence>
                {signalsByStatus.invalidated.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    onCopy={handleCopySignal}
                  />
                ))}
              </AnimatePresence>
              {signalsByStatus.invalidated.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No invalidated signals
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalDashboard;
