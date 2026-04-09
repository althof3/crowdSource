'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Cast providers to bypass React 19 type mismatch
const Connection = ConnectionProvider as React.ComponentType<any>;
const Wallet = WalletProvider as React.ComponentType<any>;
const Modal = WalletModalProvider as React.ComponentType<any>;

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => {
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <Connection endpoint={endpoint}>
      <Wallet wallets={wallets} autoConnect>
        <Modal>{children}</Modal>
      </Wallet>
    </Connection>
  );
};
