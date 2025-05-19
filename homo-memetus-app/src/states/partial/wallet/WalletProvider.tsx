'use client';
import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletContext } from '@/states/partial/wallet/WalletContext';
import { WalletAdapterNetwork, WalletName } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  MathWalletAdapter,
  TrustWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

type Props = {
  children: ReactNode;
  network: WalletAdapterNetwork;
  endpoint: string;
  wallets: (
    | PhantomWalletAdapter
    | SolflareWalletAdapter
    | MathWalletAdapter
    | TrustWalletAdapter
    | CoinbaseWalletAdapter
  )[];
};

const WalletProvider = ({ children, network, endpoint, wallets }: Props) => {
  const { connection: walletConnection } = useConnection();
  const [canConnect, setCanConnect] = useState<boolean>(false);
  const [wallet, setWallet] = useState<WalletName | null>(null);
  const [address, setAddress] = useState<string | null | undefined>(undefined);
  const [balance, setBalance] = useState<number | null>(null);
  const {
    wallet: connectedWallet,
    publicKey,
    select,
    connect,
    connected,
  } = useWallet();
  // useEffect(() => {
  //   if (!walletConnection || !publicKey) {
  //     setAddress(null);
  //     return;
  //   }

  //   walletConnection.onAccountChange(
  //     publicKey,
  //     (updatedAccountInfo) => {
  //       setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
  //     },
  //     "confirmed"
  //   );

  //   walletConnection.getAccountInfo(publicKey).then((info) => {
  //     if (info) {
  //       setBalance(info?.lamports / LAMPORTS_PER_SOL);
  //     }
  //   });
  // }, [publicKey, walletConnection]);

  useEffect(() => {
    if (connectedWallet && !wallet && canConnect) {
      select(connectedWallet.adapter.name);
      connect();
      setWallet(connectedWallet?.adapter.name);
    }
    setAddress(publicKey ? publicKey?.toBase58()! : null);
  }, [publicKey, walletConnection, wallet, canConnect]);

  const contextValue = useMemo(() => {
    return {
      network,
      endpoint,
      wallets,
      wallet,
      address,
      balance,
      connection: walletConnection,
      setWallet,
      setAddress,
      setBalance,
      canConnect,
      setCanConnect,
    };
  }, [network, endpoint, wallet, address, walletConnection, balance]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useConnect = () => {
  return useContext(WalletContext);
};

export default WalletProvider;
