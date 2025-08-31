import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MarketStatusProps {
  className?: string;
}

const MarketStatus: React.FC<MarketStatusProps> = ({ className = '' }) => {
  const [marketStatus, setMarketStatus] = useState<{
    isOpen: boolean;
    session: string;
    nextSession: string;
    timeToNext: string;
  }>({
    isOpen: false,
    session: 'Closed',
    nextSession: 'Pre-Market',
    timeToNext: ''
  });

  useEffect(() => {
    const updateMarketStatus = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const et = new Date(utc + (-5 * 3600000)); // EST/EDT
      
      const hour = et.getHours();
      const minute = et.getMinutes();
      const currentTime = hour * 60 + minute;
      
      // Market hours in EST (minutes from midnight)
      const preMarket = 4 * 60; // 4:00 AM
      const marketOpen = 9 * 60 + 30; // 9:30 AM  
      const marketClose = 16 * 60; // 4:00 PM
      const afterHours = 20 * 60; // 8:00 PM
      
      let isOpen = false;
      let session = 'Closed';
      let nextSession = 'Pre-Market';
      let nextTime = preMarket;
      
      if (currentTime >= preMarket && currentTime < marketOpen) {
        session = 'Pre-Market';
        nextSession = 'Market Open';
        nextTime = marketOpen;
      } else if (currentTime >= marketOpen && currentTime < marketClose) {
        isOpen = true;
        session = 'Market Open';
        nextSession = 'After Hours';
        nextTime = marketClose;
      } else if (currentTime >= marketClose && currentTime < afterHours) {
        session = 'After Hours';
        nextSession = 'Market Closed';
        nextTime = afterHours;
      } else {
        session = 'Market Closed';
        nextSession = 'Pre-Market';
        nextTime = preMarket + (currentTime >= afterHours ? 24 * 60 : 0);
      }
      
      // Calculate time to next session
      let minutesToNext = nextTime - currentTime;
      if (minutesToNext < 0) minutesToNext += 24 * 60;
      
      const hoursToNext = Math.floor(minutesToNext / 60);
      const minsToNext = minutesToNext % 60;
      const timeToNext = `${hoursToNext}h ${minsToNext}m`;
      
      setMarketStatus({
        isOpen,
        session,
        nextSession,
        timeToNext
      });
    };
    
    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-card-bg rounded-xl p-3 border border-gray-700/30 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            marketStatus.isOpen ? 'bg-green-500' : 
            marketStatus.session.includes('Pre') || marketStatus.session.includes('After') ? 'bg-yellow-500' : 
            'bg-red-500'
          }`} />
          <span className="text-white font-medium text-sm">{marketStatus.session}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">{marketStatus.nextSession} in</div>
          <div className="text-xs text-white font-mono">{marketStatus.timeToNext}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketStatus;
