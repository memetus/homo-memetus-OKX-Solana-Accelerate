import {
  CoinbaseWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets';

export type WalletAdapterType = {
  phantom: PhantomWalletAdapter;
  solfare: SolflareWalletAdapter;
  mathWallet: MathWalletAdapter;
  trustWallet: TrustWalletAdapter;
  coinbase: CoinbaseWalletAdapter;
};
