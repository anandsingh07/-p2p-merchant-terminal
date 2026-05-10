'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowRight, 
  Clock, 
  Wallet, 
  X, 
  RefreshCcw,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  AlertCircle,
  Smartphone
} from "lucide-react";
import { useBharatPrice } from '@/hooks/useBharatPrice';
import { useTransactionWatcher } from '@/hooks/useTransactionWatcher';
import { useMerchantHistory } from '@/hooks/useMerchantHistory';
import { useSettlement } from '@/hooks/useSettlement';
import { parseUnits } from 'viem';
import { ConnectButton, useActiveAccount, useConnectModal, useWalletBalance } from 'thirdweb/react';
import { client } from '@/components/providers/ThirdwebProvider';
import { baseSepolia } from 'thirdweb/chains';

// Constants
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Native USDC on Base Sepolia
const CHAIN_ID = 84532; // Base Sepolia

export default function BharatSwapTerminal() {
  const account = useActiveAccount();
  const MERCHANT_ADDRESS = account?.address as `0x${string}` | undefined;
  const isConnected = !!account;
  const { connect } = useConnectModal();
  const [inrAmount, setInrAmount] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'GENERATING' | 'WAITING' | 'SUCCESS'>('IDLE');
  const [qrValue, setQrValue] = useState('');
  const { rate, loading: priceLoading, convertInrToUsdc } = useBharatPrice();
  const [balance, setBalance] = useState('0.00');
  const { history, loading: historyLoading } = useMerchantHistory(MERCHANT_ADDRESS);
  const { feeConfig } = useSettlement();

  const usdcAmount = convertInrToUsdc(inrAmount);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Watch for transactions when in WAITING state
  useTransactionWatcher(
    MERCHANT_ADDRESS as `0x${string}`,
    status === 'WAITING' ? usdcAmount : '0.00',
    () => setStatus('SUCCESS')
  );

  // Balance Sync
  const { data: walletBalance } = useWalletBalance({
    chain: baseSepolia,
    client,
    address: MERCHANT_ADDRESS,
    tokenAddress: USDC_ADDRESS,
  });

  useEffect(() => {
    if (walletBalance) {
      setBalance(walletBalance.displayValue);
    }
  }, [walletBalance]);

  const handleKeypadClick = (val: string) => {
    if (status !== 'IDLE') return;
    if (val === 'DEL') {
      setInrAmount(prev => prev.slice(0, -1));
    } else if (val === '.') {
      if (!inrAmount.includes('.')) setInrAmount(prev => prev + '.');
    } else {
      if (inrAmount.length < 9) setInrAmount(prev => prev + val);
    }
  };

  const handleGenerateQR = () => {
    if (!inrAmount || Number(inrAmount) === 0 || !MERCHANT_ADDRESS) return;
    setStatus('GENERATING');
    
    const amountInWei = parseUnits(usdcAmount, 6).toString();
    const uri = `ethereum:${USDC_ADDRESS}@${CHAIN_ID}/transfer?address=${MERCHANT_ADDRESS}&uint256=${amountInWei}`;
    
    setTimeout(() => {
      setQrValue(uri);
      setStatus('WAITING');
    }, 800);
  };

  const reset = () => {
    setInrAmount('');
    setStatus('IDLE');
    setQrValue('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-4 md:p-8 flex flex-col items-center justify-center selection:bg-emerald-500/30">
      
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/40 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
              BharatSwap
            </h1>
            <p className="text-zinc-500 text-sm font-medium">Merchant Terminal</p>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && mounted && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowHistory(true)}
                className="p-2 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-400 hover:text-emerald-400"
              >
                <Clock size={18} />
              </motion.button>
            )}
            {isConnected && mounted && (
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">{Number(balance).toFixed(2)} USDC</span>
              </div>
            )}
            <ConnectButton 
              client={client}
              chain={baseSepolia}
              theme="dark"
              connectButton={{
                className: "rounded-full py-2 px-4 bg-zinc-900 border border-zinc-800 text-xs",
                label: "Connect"
              }}
            />
          </div>
        </div>

        {/* Pricing Ticker */}
        <div className="px-6 py-2 overflow-hidden bg-zinc-900/50 border-y border-zinc-800">
          <motion.div 
            animate={{ x: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="flex justify-center items-center whitespace-nowrap gap-10"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Rate</span>
              <span className="text-sm font-bold text-zinc-200">1 USDC = ₹{rate?.toFixed(2) || '91.00'}</span>
            </div>
          </motion.div>
        </div>

        {/* Amount Display */}
        <div className="p-6 flex flex-col items-center relative">
          {!isConnected && (
            <div className="absolute inset-0 z-10 bg-zinc-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-zinc-300">
              <Wallet size={32} className="text-zinc-500 mb-2" />
              <p className="text-sm font-bold">Connect Wallet to Start</p>
            </div>
          )}
          <div className="relative w-full text-center group">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl text-zinc-600 font-medium">₹</span>
            <div className="text-6xl font-bold tracking-tighter truncate px-8 h-20 flex items-center justify-center">
              {inrAmount || '0'}
              <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-1 h-12 bg-emerald-500 ml-1 rounded-full"
              />
            </div>
          </div>
          <div className="mt-2 text-center text-zinc-500">
            <div className="flex items-center justify-center gap-2">
              <ArrowRight size={14} />
              <span className="text-lg font-medium">{usdcAmount} USDC</span>
            </div>
          </div>
        </div>

        {/* Keypad */}
        <div className="p-6 pt-0 grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((btn) => (
            <motion.button
              key={btn}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleKeypadClick(btn)}
              className={`h-16 rounded-2xl text-xl font-semibold flex items-center justify-center transition-colors ${
                btn === 'DEL' ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-200 hover:bg-white/5'
              } ${status !== 'IDLE' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {btn}
            </motion.button>
          ))}
        </div>

        {/* Action Button */}
        <div className="p-6 pt-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => !isConnected ? connect({ client }) : handleGenerateQR()}
            disabled={status !== 'IDLE' || (isConnected && (!inrAmount || Number(inrAmount) === 0))}
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-3xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"
          >
            {!isConnected ? (
              <><Wallet size={20} /> Connect Wallet</>
            ) : status === 'GENERATING' ? (
              <RefreshCcw className="animate-spin" />
            ) : (
              <><Smartphone size={20} /> Generate Payment QR</>
            )}
          </motion.button>
        </div>

        {/* QR Overlay */}
        <AnimatePresence>
          {status !== 'IDLE' && status !== 'GENERATING' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8"
            >
              <button onClick={reset} className="absolute top-6 right-6 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white">
                <X size={20} />
              </button>

              {status === 'WAITING' && (
                <>
                  <div className="bg-white p-6 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <QRCodeSVG value={qrValue} size={200} level="H" />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="text-xl font-bold mb-2">Scan to Pay</h3>
                    <p className="text-zinc-500 text-sm mb-6 max-w-[200px] mx-auto">
                      Scan with any wallet to pay <span className="text-emerald-400 font-bold">{usdcAmount} USDC</span>
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Waiting for settlement...</span>
                    </div>
                  </div>
                </>
              )}

              {status === 'SUCCESS' && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Payment Received!</h3>
                  <p className="text-zinc-400 mb-8">₹{inrAmount} settled as {usdcAmount} USDC</p>
                  <button onClick={reset} className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full font-bold">
                    Done
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* History Slide-over */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
              <h2 className="text-xl font-bold">Transaction History</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {historyLoading ? (
                <div className="flex justify-center p-12"><RefreshCcw className="animate-spin text-zinc-700" /></div>
              ) : history.length === 0 ? (
                <div className="text-center py-20 text-zinc-600">No transactions yet</div>
              ) : (
                history.map((tx) => (
                  <div key={tx.id} className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className={`w-10 h-10 ${tx.type === 'RECEIVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} rounded-full flex items-center justify-center`}>
                        {tx.type === 'RECEIVED' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">₹{tx.inrValue}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${tx.type === 'RECEIVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {tx.type}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">{tx.value} USDC</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 font-mono">{tx.from.slice(0, 6)}...{tx.from.slice(-4)}</p>
                      <p className="text-[10px] text-zinc-400 font-semibold">{tx.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <p className="mt-8 text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
        <AlertCircle size={10} />
        BharatSwap Secure Terminal • Base Sepolia
      </p>
    </div>
  );
}
