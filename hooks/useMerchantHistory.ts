'use client';

import { useState, useEffect } from 'react';
import { getContractEvents, prepareEvent } from "thirdweb";
import { client } from "@/components/providers/ThirdwebProvider";
import { baseSepolia } from "thirdweb/chains";
import { formatUnits, createPublicClient, http } from "viem";

const NATIVE_USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const BRIDGED_USDC = '0xDABa329Ed949f28F64019f22c33c3B253B2Ded60';

const transferEvent = prepareEvent({
  signature: "event Transfer(address indexed from, address indexed to, uint256 value)"
});

export interface Transaction {
  id: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  fullDate: string;
  inrValue: string;
  type: 'RECEIVED' | 'SENT';
}

export function useMerchantHistory(merchantAddress: string | undefined) {
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!merchantAddress) return;
    setLoading(true);
    
    try {
      const publicClient = createPublicClient({
        chain: {
          id: 84532,
          name: 'Base Sepolia',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: { default: { http: ['https://sepolia.base.org'] }, public: { http: ['https://sepolia.base.org'] } }
        },
        transport: http()
      });

      const fetchLogs = async (addr: string) => {
        const contract = { address: addr, chain: baseSepolia, client } as any;
        const events = await getContractEvents({
          contract,
          events: [transferEvent],
          fromBlock: "earliest",
        });

        // Get unique block numbers and fetch timestamps for more items
        const blockNumbers = [...new Set(events.map(e => e.blockNumber))].slice(0, 20); 
        const blockMap: Record<string, string> = {};

        await Promise.all(blockNumbers.map(async (bn) => {
          try {
            const block = await publicClient.getBlock({ blockNumber: bn });
            blockMap[bn.toString()] = new Date(Number(block.timestamp) * 1000).toISOString();
          } catch (e) {}
        }));

        return events
          .filter((e: any) => 
            e.args.to?.toLowerCase() === merchantAddress.toLowerCase() || 
            e.args.from?.toLowerCase() === merchantAddress.toLowerCase()
          )
          .map((e: any) => {
            const isReceived = e.args.to?.toLowerCase() === merchantAddress.toLowerCase();
            const val = formatUnits(e.args.value || 0n, 6);
            const dateStr = blockMap[e.blockNumber.toString()] || new Date().toISOString();
            const dateObj = new Date(dateStr);
            
            return {
              id: e.transactionHash,
              from: isReceived ? e.args.from : e.args.to,
              to: e.args.to,
              value: val,
              timestamp: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              fullDate: dateObj.toLocaleDateString(),
              inrValue: (Number(val) * 91).toFixed(2),
              type: isReceived ? 'RECEIVED' : 'SENT',
            };
          });
      };

      const [native, bridged] = await Promise.all([
        fetchLogs(NATIVE_USDC),
        fetchLogs(BRIDGED_USDC)
      ]);

      setHistory([...native, ...bridged].sort((a, b) => Number(native.indexOf(b)) - Number(native.indexOf(a))));
    } catch (err) {
      console.error("History Fetch Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [merchantAddress]);

  return { history, loading, refresh: fetchHistory };
}
