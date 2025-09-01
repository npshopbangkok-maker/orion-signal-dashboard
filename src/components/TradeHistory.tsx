import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TradeRecord, TradeSummary } from '../types/trade';

const mockTrades: TradeRecord[] = [
  {
    id: 'trade-001',
    signalId: 'signal-001',
    symbol: 'EURUSD',
    direction: 'long',
    entryTime: '2024-01-01T09:15:00Z',
    entryPrice: 1.0950,
    exitTime: '2024-01-01T11:30:00Z',
    exitPrice: 1.1020,
    exitType: 'tp2',
    stopLoss: 1.0900,
    takeProfits: [1.1000, 1.1050, 1.1100],
    quantity: 0.1,
    status: 'closed',
    pnl: 70,
    pnlPercent: 1.4,
    rrRealized: 1.4,
    reason: 'London breakout strategy',
    confidence: 85,
    killzone: 'London Open',
    notes: 'Clean breakout with good volume',
    executedBy: 'auto',
    createdAt: '2024-01-01T09:15:00Z',
    updatedAt: '2024-01-01T11:30:00Z'
  },
  {
    id: 'trade-002',
    signalId: 'signal-002',
    symbol: 'GBPUSD',
    direction: 'short',
    entryTime: '2024-01-01T13:45:00Z',
    entryPrice: 1.2750,
    exitTime: '2024-01-01T14:15:00Z',
    exitPrice: 1.2720,
    exitType: 'stop_loss',
    stopLoss: 1.2780,
    takeProfits: [1.2700, 1.2650, 1.2600],
    quantity: 0.1,
    status: 'closed',
    pnl: -30,
    pnlPercent: -0.24,
    rrRealized: -1,
    reason: 'False breakout reversal',
    confidence: 70,
    killzone: 'New York Open',
    notes: 'Stopped out on news spike',
    executedBy: 'auto',
    createdAt: '2024-01-01T13:45:00Z',
    updatedAt: '2024-01-01T14:15:00Z'
  },
  {
    id: 'trade-003',
    signalId: 'signal-003',
    symbol: 'USDJPY',
    direction: 'long',
    entryTime: '2024-01-01T15:30:00Z',
    entryPrice: 149.50,
    stopLoss: 148.80,
    takeProfits: [150.20, 150.80, 151.40],
    quantity: 0.1,
    status: 'active',
    reason: 'Trend continuation',
    confidence: 90,
    killzone: 'New York Session',
    notes: 'Strong momentum setup',
    executedBy: 'auto',
    createdAt: '2024-01-01T15:30:00Z',
    updatedAt: '2024-01-01T15:30:00Z'
  }
];

export default function TradeHistory() {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'winning' | 'losing'>('all');
  const [trades] = useState<TradeRecord[]>(mockTrades);
  const [summary, setSummary] = useState<TradeSummary | null>(null);

  useEffect(() => {
    // Calculate summary
    const closedTrades = trades.filter(t => t.status === 'closed');
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
    const activeTrades = trades.filter(t => t.status === 'active');
    
    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const wins = winningTrades.map(t => t.pnl || 0);
    const losses = losingTrades.map(t => t.pnl || 0);
    
    setSummary({
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      activeTrades: activeTrades.length,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      totalPnl,
      totalPnlPercent: closedTrades.reduce((sum, t) => sum + (t.pnlPercent || 0), 0),
      avgWin: wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0,
      avgLoss: losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0,
      profitFactor: Math.abs(losses.reduce((a, b) => a + b, 0)) > 0 
        ? wins.reduce((a, b) => a + b, 0) / Math.abs(losses.reduce((a, b) => a + b, 0)) 
        : 0,
      bestTrade: Math.max(...closedTrades.map(t => t.pnl || 0)),
      worstTrade: Math.min(...closedTrades.map(t => t.pnl || 0)),
      avgHoldTime: '2h 15m' // Calculated from entry/exit times
    });
  }, [trades]);

  const filteredTrades = trades.filter(trade => {
    switch (filter) {
      case 'active': return trade.status === 'active';
      case 'closed': return trade.status === 'closed';
      case 'winning': return trade.status === 'closed' && (trade.pnl || 0) > 0;
      case 'losing': return trade.status === 'closed' && (trade.pnl || 0) < 0;
      default: return true;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-400';
      case 'closed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPnlColor = (pnl?: number) => {
    if (!pnl) return 'text-gray-400';
    return pnl > 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="bg-[#0b1220] min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">📊 Trade History</h1>
          <p className="text-gray-400">รายการเทรดทั้งหมดและสรุปผลการดำเนินงาน</p>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
          >
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm">Total Trades</div>
              <div className="text-white text-xl font-bold">{summary.totalTrades}</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm">Win Rate</div>
              <div className={`text-xl font-bold ${summary.winRate >= 60 ? 'text-green-400' : summary.winRate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {summary.winRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm">Total P&L</div>
              <div className={`text-xl font-bold ${getPnlColor(summary.totalPnl)}`}>
                ${summary.totalPnl > 0 ? '+' : ''}{summary.totalPnl.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm">Profit Factor</div>
              <div className={`text-xl font-bold ${summary.profitFactor >= 2 ? 'text-green-400' : summary.profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                {summary.profitFactor.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm">Best Trade</div>
              <div className="text-green-400 text-xl font-bold">+${summary.bestTrade.toFixed(2)}</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm">Worst Trade</div>
              <div className="text-red-400 text-xl font-bold">${summary.worstTrade.toFixed(2)}</div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'closed', 'winning', 'losing'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filterType === 'all' && 'All Trades'}
                {filterType === 'active' && `Active (${summary?.activeTrades || 0})`}
                {filterType === 'closed' && 'Closed'}
                {filterType === 'winning' && `Winning (${summary?.winningTrades || 0})`}
                {filterType === 'losing' && `Losing (${summary?.losingTrades || 0})`}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Trade List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Symbol</th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Direction</th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Entry</th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Exit</th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">P&L</th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">R:R</th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade, index) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-t border-gray-700 hover:bg-gray-800/20"
                  >
                    <td className="px-4 py-4">
                      <div className="text-white font-medium">{trade.symbol}</div>
                      <div className="text-xs text-gray-400">{trade.reason}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        trade.direction === 'long' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}>
                        {trade.direction === 'long' ? '📈 LONG' : '📉 SHORT'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-white">{trade.entryPrice.toFixed(5)}</div>
                      <div className="text-xs text-gray-400">{new Date(trade.entryTime).toLocaleTimeString('th-TH')}</div>
                    </td>
                    <td className="px-4 py-4">
                      {trade.exitPrice ? (
                        <div>
                          <div className="text-white">{trade.exitPrice.toFixed(5)}</div>
                          <div className="text-xs text-gray-400">{trade.exitType}</div>
                        </div>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className={`font-medium ${getPnlColor(trade.pnl)}`}>
                        {trade.pnl ? `$${trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}` : '-'}
                      </div>
                      {trade.pnlPercent && (
                        <div className={`text-xs ${getPnlColor(trade.pnl)}`}>
                          {trade.pnlPercent > 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-white">
                        {trade.rrRealized ? `${trade.rrRealized.toFixed(1)}:1` : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        trade.status === 'active' ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-900/50 text-gray-400'
                      }`}>
                        {trade.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-gray-300">{new Date(trade.createdAt).toLocaleDateString('th-TH')}</div>
                      <div className="text-xs text-gray-400">{trade.killzone}</div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {filteredTrades.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📊</div>
            <div className="text-gray-400 text-lg">ไม่มีข้อมูลเทรดสำหรับตัวกรองนี้</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
