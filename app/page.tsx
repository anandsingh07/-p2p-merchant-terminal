'use client';

import dynamic from 'next/dynamic';

const BharatSwapTerminal = dynamic(
  () => import('@/components/terminal/BharatSwapTerminal'),
  { ssr: false }
);

export default function Home() {
  return <BharatSwapTerminal />;
}
