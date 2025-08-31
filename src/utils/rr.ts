// R:R calculation utilities
export function rrPerTp(entry: number, sl: number, tp: number, side: 'LONG' | 'SHORT' | 'long' | 'short'): number | null {
  if (!entry || !sl || !tp) return null;
  
  const normalizedSide = side.toUpperCase() as 'LONG' | 'SHORT';
  const risk = normalizedSide === 'LONG' ? (entry - sl) : (sl - entry);
  const reward = normalizedSide === 'LONG' ? (tp - entry) : (entry - tp);
  
  if (risk === 0) return null;
  return +(reward / risk).toFixed(2);
}

// Calculate overall R:R for multiple TPs
export function calculateOverallRR(entry: number, sl: number, tps: number[], side: 'LONG' | 'SHORT' | 'long' | 'short', allocations?: number[]): number | null {
  if (!entry || !sl || !tps?.length) return null;
  
  // If no allocations provided, assume equal distribution
  const defaultAllocations = allocations || tps.map(() => 1 / tps.length);
  
  let weightedReward = 0;
  const normalizedSide = side.toUpperCase() as 'LONG' | 'SHORT';
  const risk = normalizedSide === 'LONG' ? (entry - sl) : (sl - entry);
  
  if (risk === 0) return null;
  
  tps.forEach((tp, index) => {
    const reward = normalizedSide === 'LONG' ? (tp - entry) : (entry - tp);
    const allocation = defaultAllocations[index] || 0;
    weightedReward += reward * allocation;
  });
  
  return +(weightedReward / risk).toFixed(2);
}
