import { useOrders } from '@p2pdotme/sdk/react';
import { useState, useEffect } from 'react';

export function useSettlement() {
  const orders = useOrders();
  const [loading, setLoading] = useState(false);
  const [feeConfig, setFeeConfig] = useState<{ threshold: string; fee: number } | null>(null);

  useEffect(() => {
    async function fetchFee() {
      try {
        const config = await orders.getFeeConfig({ currency: 'INR' });
        config.match(
          (ok) => {
            setFeeConfig({
              threshold: ok.smallOrderThreshold.toString(),
              fee: Number(ok.smallOrderFixedFee) / 10000 // Convert to percentage
            });
          },
          () => {
            // Fallback
            setFeeConfig({ threshold: '2000000', fee: 1 });
          }
        );
      } catch (e) {
        setFeeConfig({ threshold: '2000000', fee: 1 });
      }
    }
    fetchFee();
  }, [orders]);

  return {
    feeConfig,
    loading
  };
}
