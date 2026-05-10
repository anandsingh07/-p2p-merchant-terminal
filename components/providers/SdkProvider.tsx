'use client';

import { SdkProvider as P2PSdkProvider } from '@p2pdotme/sdk/react';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { ReactNode, useMemo } from 'react';

const RPC_URL = 'https://sepolia.base.org';
const DIAMOND_ADDRESS = '0xce868398FDaDcA368EAc203222874D6888532aE2';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/110312/indexer-one/version/latest';

export function SdkProvider({ children }: { children: ReactNode }) {
  const publicClient = useMemo(() => 
    createPublicClient({
      chain: baseSepolia,
      transport: http(RPC_URL),
    }), 
  []);

  return (
    <P2PSdkProvider
      publicClient={publicClient}
      diamondAddress={DIAMOND_ADDRESS as `0x${string}`}
      usdcAddress={USDC_ADDRESS as `0x${string}`}
      subgraphUrl={SUBGRAPH_URL}
    >
      {children}
    </P2PSdkProvider>
  );
}
