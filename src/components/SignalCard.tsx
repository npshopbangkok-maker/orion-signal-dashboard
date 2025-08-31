import React from 'react';
import { motion } from 'framer-motion';
import { Signal } from '../types/signal';
import { rrPerTp } from '../utils/rr';
import { fmtPrice, fmtTime } from '../utils/format';

interface SignalCardProps {
  signal: Signal;
  onCopy: (signal: Signal) => void;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, onCopy }) => {
  const formatPrice = (price: number) => {
    return fmtPrice(signal.symbol, price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-pending/20 border-pending text-pending';
      case 'confirmed':
        return 'bg-confirmed/20 border-confirmed text-confirmed';
      case 'invalidated':
        return 'bg-invalidated/20 border-invalidated text-invalidated';
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-500';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'long' 
      ? 'bg-green-500/20 border-green-500 text-green-400'
      : 'bg-red-500/20 border-red-500 text-red-400';
  };

  const generateTradeMessage = () => {
    const entryPrice = signal.entry_price || signal.price;
    const symbol = signal.symbol;
    const side = signal.direction.toUpperCase();
    
    let message = `${symbol} | ${side}`;
    
    if (entryPrice) {
      message += `\nEntry ${formatPrice(entryPrice)}`;
    }
    
    if (signal.stop_loss) {
      message += `\nSL ${formatPrice(signal.stop_loss)}`;
    }
    
    if (signal.take_profits?.length) {
      const tpText = signal.take_profits.map((tp, i) => {
        const label = signal.tp_modes?.[i] || `TP${i + 1}`;
        return `${label} ${formatPrice(tp)}`;
      }).join(', ');
      message += `\nTP ${tpText}`;
      
      // Add R:R per TP if we have entry and SL
      if (entryPrice && signal.stop_loss) {
        const rrText = signal.take_profits.map((tp, i) => {
          const rr = rrPerTp(entryPrice, signal.stop_loss!, tp, signal.direction);
          const label = signal.tp_modes?.[i] || `TP${i + 1}`;
          return `${label} ${rr}R`;
        }).join(', ');
        message += `\nR:R per TP: ${rrText}`;
      }
    }
    
    message += `\nConfidence ${signal.confidence ? Math.round(signal.confidence * 100) : '-'}%`;
    message += `\nKillzone ${signal.killzone || '-'}`;
    message += `\nTime ${fmtTime(signal.entry_time)}`;
    
    return message;
  };

  const handleCopy = () => {
    const message = generateTradeMessage();
    navigator.clipboard.writeText(message);
    onCopy(signal);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(signal, null, 2));
    onCopy(signal);
  };

  const entryPrice = signal.entry_price || signal.price;
  const isInvalidated = signal.status === 'invalidated';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-card-bg rounded-2xl p-4 shadow-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 ${
        isInvalidated ? 'opacity-60' : ''
      }`}
    >
      {/* Header with status and direction */}
      <div className="flex items-center justify-between mb-3">
        <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(signal.status)}`}>
          {signal.status.toUpperCase()}
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDirectionColor(signal.direction)}`}>
          {signal.direction.toUpperCase()}
        </div>
      </div>

      {/* Symbol and Entry Price */}
      <div className="mb-3">
        <h3 className="text-xl font-bold text-white mb-1">{signal.symbol}</h3>
        {entryPrice && (
          <p className={`text-2xl font-mono text-blue-400 ${isInvalidated ? 'line-through' : ''}`}>
            ${formatPrice(entryPrice)}
          </p>
        )}
      </div>

      {/* Reason */}
      <div className="mb-3">
        <p className="text-gray-300 text-sm">{signal.reason}</p>
      </div>

      {/* Basic Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <span className="text-gray-400">Confidence</span>
          <p className="text-white font-medium">{Math.round(signal.confidence * 100)}%</p>
        </div>
        <div>
          <span className="text-gray-400">Killzone</span>
          <p className="text-white font-medium">{signal.killzone.toUpperCase()}</p>
        </div>
        <div>
          <span className="text-gray-400">Time</span>
          <p className="text-white font-medium">{fmtTime(signal.entry_time)}</p>
        </div>
        <div>
          <span className="text-gray-400">Overall R:R</span>
          <p className="text-white font-medium">{signal.rr_target}:1</p>
        </div>
      </div>

      {/* Trading Levels Section */}
      {(entryPrice || signal.stop_loss || signal.take_profits?.length) && (
        <div className="mb-4 p-3 bg-dark-bg/50 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Levels</h4>
          
          {/* Entry and SL */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            {entryPrice && (
              <div>
                <span className="text-gray-400">Entry</span>
                <p className={`text-white font-mono ${isInvalidated ? 'line-through' : ''}`}>
                  {formatPrice(entryPrice)}
                </p>
              </div>
            )}
            {signal.stop_loss && (
              <div>
                <span className="text-gray-400">Stop Loss</span>
                <p className={`text-red-400 font-mono ${isInvalidated ? 'line-through' : ''}`}>
                  {formatPrice(signal.stop_loss)}
                </p>
              </div>
            )}
          </div>

          {/* Take Profits */}
          {signal.take_profits?.length && (
            <div>
              <span className="text-gray-400 text-xs mb-2 block">Take Profits</span>
              <div className="space-y-1">
                {signal.take_profits.map((tp, index) => {
                  const label = signal.tp_modes?.[index] || `TP${index + 1}`;
                  const rr = entryPrice && signal.stop_loss 
                    ? rrPerTp(entryPrice, signal.stop_loss, tp, signal.direction)
                    : null;
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded-lg ${
                        isInvalidated ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400 text-xs font-medium">
                          {label}
                        </span>
                        <span className={`text-white font-mono text-sm ${isInvalidated ? 'line-through' : ''}`}>
                          {formatPrice(tp)}
                        </span>
                      </div>
                      {rr !== null && (
                        <span className="text-green-300 text-xs bg-green-500/20 px-2 py-1 rounded">
                          {rr}R
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Copy Trade Message
        </button>
        <button
          onClick={handleCopyJSON}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium py-1 px-4 rounded-lg transition-colors duration-200"
        >
          Copy as JSON
        </button>
      </div>
    </motion.div>
  );
};

export default SignalCard;
