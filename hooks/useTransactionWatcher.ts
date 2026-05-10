'use client';

import { useEffect } from 'react';
import { createPublicClient, http, parseAbiItem, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Native USDC on Base Sepolia
const RPC_URL = 'https://sepolia.base.org';

export function useTransactionWatcher(
  merchantAddress: `0x${string}`,
  expectedAmount: string,
  onSuccess: () => void
) {
  useEffect(() => {
    if (!merchantAddress || !expectedAmount || expectedAmount === '0.00' || expectedAmount === '0') return;

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(RPC_URL),
    });

    const expectedValue = parseUnits(expectedAmount, 6);
    // Allow for a tiny 1% margin or just check if it's >= expected
    // Most wallets will pay exactly or slightly more due to rounding
    const minAcceptable = (expectedValue * BigInt(999)) / BigInt(1000); 

    const unwatch = publicClient.watchEvent({
      address: USDC_ADDRESS,
      event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      args: {
        to: merchantAddress,
      },
      onLogs: (logs) => {
        for (const log of logs) {
          const received = log.args.value ?? BigInt(0);
          console.log(`Detected Transfer: ${received} | Expected: ${expectedValue}`);
          
          if (received >= minAcceptable) {
            console.log(`Verified payment received!`);
            onSuccess();
          }
        }
      },
    });

    return () => unwatch();
  }, [merchantAddress, expectedAmount, onSuccess]);
}
