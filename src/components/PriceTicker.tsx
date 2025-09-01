import React from 'react';
import { motion } from 'framer-motion';
import { PriceData } from '../types/signal';
import { fmtPrice } from '../utils/format';

interface PriceTickerProps {
  prices: Record<string, PriceData>;
  isMarketOpen: boolean;
}

const PriceTicker: React.FC<PriceTickerProps> = ({ prices, isMarketOpen }) => {
  const symbols = ['MNQ', 'NQ', 'MES', 'ES'];
  
  // Mock data for when live data is not available
  const mockPrices: Record<string, PriceData> = {
    'NQ': { 
      symbol: 'NQ',
      price: 20125.50, 
      change: 45.25, 
      change_percent: 0.23, 
      volume: 125420,
      timestamp: new Date().toISOString()
    },
    'MNQ': { 
      symbol: 'MNQ',
      price: 20125.50, 
      change: 45.25, 
      change_percent: 0.23, 
      volume: 89340,
      timestamp: new Date().toISOString()
    },
    'ES': { 
      symbol: 'ES',
      price: 5695.25, 
      change: -12.75, 
      change_percent: -0.22, 
      volume: 234680,
      timestamp: new Date().toISOString()
    },
    'MES': { 
      symbol: 'MES',
      price: 5695.25, 
      change: -12.75, 
      change_percent: -0.22, 
      volume: 156720,
      timestamp: new Date().toISOString()
    }
  };
  
  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-400';
    return change > 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatChange = (change?: number, changePercent?: number) => {
    if (!change) return '';
    const sign = change > 0 ? '+' : '';
    const percentText = changePercent ? ` (${sign}${changePercent.toFixed(2)}%)` : '';
    return `${sign}${change.toFixed(2)}${percentText}`;
  };

  return (
    <div className="bg-card-bg rounded-2xl p-4 mb-6 shadow-lg border border-gray-700/30">
      {/* Market Status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Market Prices</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${Object.keys(prices).length > 0 || isMarketOpen ? 'bg-green-500' : 'bg-amber-500'}`} />
          <span className="text-sm text-gray-300">
            {Object.keys(prices).length > 0 ? 'Live Data' : isMarketOpen ? 'Market Open' : 'Demo Mode'}
          </span>
        </div>
      </div>

      {/* Price Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {symbols.map((symbol) => {
          const priceData = prices[symbol] || mockPrices[symbol];
          return (
            <motion.div
              key={symbol}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-bg/50 rounded-xl p-3 border border-gray-600/30"
            >
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-300 mb-1">{symbol}</h4>
                {priceData ? (
                  <>
                    <div className="text-xl font-mono font-bold text-white">
                      ${fmtPrice(symbol, priceData.price)}
                    </div>
                    <div className={`text-xs font-medium ${getChangeColor(priceData.change)}`}>
                      {formatChange(priceData.change, priceData.change_percent)}
                    </div>
                    {priceData.volume && (
                      <div className="text-xs text-gray-400 mt-1">
                        Vol: {priceData.volume.toLocaleString()}
                      </div>
                    )}
                    {!prices[symbol] && (
                      <div className="text-xs text-amber-400 mt-1">
                        📊 Demo Data
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400 text-sm">
                    <div className="animate-pulse">Loading...</div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Last Update */}
      <div className="text-center mt-4 text-xs text-gray-400">
        Last update: {new Date().toLocaleTimeString()} • {Object.keys(prices).length > 0 ? 'Live Feed' : 'Demo Mode'}
      </div>
    </div>
  );
};

export default PriceTicker;
