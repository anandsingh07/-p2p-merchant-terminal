'use client';

import { usePrices } from '@p2pdotme/sdk/react';
import { useEffect, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';

export function useBharatPrice() {
  const prices = usePrices();
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = async () => {
    if (typeof window === 'undefined') return;
    try {
      setLoading(true);
      const result = await prices.getPriceConfig({ currency: 'INR' });
      
      result.match(
        (config) => {
          // Use buyPrice for INR -> USDC conversion (Customer buying USDC)
          const r = Number(formatUnits(config.buyPrice, 6));
          setRate(r);
          setError(null);
        },
        (err) => {
          console.error('Failed to fetch price:', err);
          setError(err.message);
        }
      );
    } catch (e) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [prices]);

  const convertInrToUsdc = (inrAmount: string | number) => {
    if (!rate || !inrAmount) return '0.00';
    const amount = Number(inrAmount);
    return (amount / rate).toFixed(2);
  };

  return {
    rate,
    loading,
    error,
    convertInrToUsdc,
    refresh: fetchRate
  };
}
