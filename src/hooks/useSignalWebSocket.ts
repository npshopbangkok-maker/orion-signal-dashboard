import { useState, useEffect, useRef } from 'react';
import { Signal, WebSocketMessage } from '../types/signal';

const DEMO_SYMBOLS = ['MNQ', 'NQ', 'MES'];
const DEMO_KILLZONES = ['asia', 'london', 'ny_am', 'lunch', 'pm'];
const DEMO_REASONS = [
  'MSS+FVG setup',
  'Order Block retest',
  'Liquidity sweep',
  'SMT divergence',
  'BOS confirmation',
  'Premium/Discount entry'
];

const generateDemoSignal = (): Signal => {
  const symbol = DEMO_SYMBOLS[Math.floor(Math.random() * DEMO_SYMBOLS.length)];
  const direction = Math.random() > 0.5 ? 'long' : 'short';
  const basePrice = symbol === 'MNQ' ? 19000 : symbol === 'NQ' ? 17000 : 4500;
  const entryPrice = basePrice + (Math.random() - 0.5) * 1000;
  
  // Generate realistic SL and TP levels
  const isLong = direction === 'long';
  const slDistance = 15 + Math.random() * 35; // 15-50 points SL
  const stopLoss = isLong ? entryPrice - slDistance : entryPrice + slDistance;
  
  // Generate 1-4 TP levels
  const numTPs = Math.floor(Math.random() * 4) + 1;
  const takeProfits: number[] = [];
  const tpModes: string[] = [];
  
  for (let i = 0; i < numTPs; i++) {
    const tpMultiplier = (i + 1) * (1 + Math.random() * 1.5); // Increasing R:R
    const tpDistance = slDistance * tpMultiplier;
    const tp = isLong ? entryPrice + tpDistance : entryPrice - tpDistance;
    takeProfits.push(Math.round(tp * 100) / 100);
    
    // Generate TP mode labels
    if (i === numTPs - 1 && numTPs > 1) {
      tpModes.push(`Runner ${20 + Math.random() * 30}%`);
    } else {
      const allocation = Math.round(30 + Math.random() * 40);
      tpModes.push(`TP${i + 1} ${allocation}%`);
    }
  }
  
  return {
    id: crypto.randomUUID(),
    status: 'pending',
    direction,
    symbol,
    entry_time: new Date().toISOString(),
    price: Math.round(entryPrice * 100) / 100, // legacy
    entry_price: Math.round(entryPrice * 100) / 100,
    stop_loss: Math.round(stopLoss * 100) / 100,
    take_profits: takeProfits,
    tp_modes: tpModes,
    reason: DEMO_REASONS[Math.floor(Math.random() * DEMO_REASONS.length)],
    confidence: Math.random() * 0.4 + 0.6, // 60-100%
    rr_target: Math.round((takeProfits[takeProfits.length - 1] - entryPrice) / Math.abs(entryPrice - stopLoss) * 100) / 100,
    killzone: DEMO_KILLZONES[Math.floor(Math.random() * DEMO_KILLZONES.length)]
  };
};

export const useSignalWebSocket = (wsUrl?: string) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const ws = useRef<WebSocket | null>(null);
  const demoInterval = useRef<number | null>(null);
  const expireTimeouts = useRef<Map<string, number>>(new Map());

  // Demo mode functions
  const startDemoMode = () => {
    console.log('Starting demo mode...');
    setConnectionStatus('connected');
    
    // Generate initial signals
    const initialSignals = Array.from({ length: 3 }, generateDemoSignal);
    setSignals(initialSignals);
    
    // Schedule demo signal generation
    demoInterval.current = setInterval(() => {
      const newSignal = generateDemoSignal();
      setSignals(prev => [newSignal, ...prev].slice(0, 20)); // Keep max 20 signals
      
      // Schedule status update for this signal
      const updateTimeout = setTimeout(() => {
        setSignals(prev => prev.map(s => {
          if (s.id === newSignal.id && s.status === 'pending') {
            const newStatus = Math.random() > 0.3 ? 'confirmed' : 'invalidated';
            return { ...s, status: newStatus };
          }
          return s;
        }));
      }, Math.random() * 30000 + 15000); // 15-45 seconds
      
      expireTimeouts.current.set(newSignal.id, updateTimeout);
    }, Math.random() * 10000 + 5000); // 5-15 seconds between new signals
  };

  const stopDemoMode = () => {
    if (demoInterval.current) {
      clearInterval(demoInterval.current);
      demoInterval.current = null;
    }
    // Clear all expire timeouts
    expireTimeouts.current.forEach(timeout => clearTimeout(timeout));
    expireTimeouts.current.clear();
  };

  // WebSocket functions
  const connectWebSocket = () => {
    if (!wsUrl) {
      startDemoMode();
      return;
    }

    try {
      setConnectionStatus('connecting');
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          if (message.type === 'signal' && message.payload) {
            const signal = message.payload;
            setSignals(prev => {
              // Check if signal already exists (update) or is new
              const existingIndex = prev.findIndex(s => s.id === signal.id);
              if (existingIndex >= 0) {
                // Update existing signal
                const newSignals = [...prev];
                newSignals[existingIndex] = signal;
                return newSignals;
              } else {
                // Add new signal to the beginning
                return [signal, ...prev].slice(0, 50); // Keep max 50 signals
              }
            });

            // Set expiration timeout for pending signals
            if (signal.status === 'pending') {
              const expireTimeout = setTimeout(() => {
                setSignals(prev => prev.map(s => 
                  s.id === signal.id && s.status === 'pending' 
                    ? { ...s, status: 'invalidated' } 
                    : s
                ));
              }, 5 * 60 * 1000); // 5 minutes
              
              expireTimeouts.current.set(signal.id, expireTimeout);
            } else {
              // Clear expiration timeout if signal is no longer pending
              const existingTimeout = expireTimeouts.current.get(signal.id);
              if (existingTimeout) {
                clearTimeout(existingTimeout);
                expireTimeouts.current.delete(signal.id);
              }
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnectionStatus('disconnected');
      // Fall back to demo mode
      startDemoMode();
    }
  };

  const disconnect = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    stopDemoMode();
    setConnectionStatus('disconnected');
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      disconnect();
    };
  }, [wsUrl]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      expireTimeouts.current.forEach(timeout => clearTimeout(timeout));
      expireTimeouts.current.clear();
    };
  }, []);

  return {
    signals,
    connectionStatus,
    reconnect: connectWebSocket,
    disconnect
  };
};
