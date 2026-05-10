'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// This dynamically loads the SdkProvider only on the client
const DynamicSdkProvider = dynamic(
  () => import('./SdkProvider').then(mod => mod.SdkProvider),
  { ssr: false }
);

export function SafeSdkProvider({ children }: { children: ReactNode }) {
  return <DynamicSdkProvider>{children}</DynamicSdkProvider>;
}
