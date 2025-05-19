import React from 'react';
import styles from '@/components/base/logo/walletLogo/WalletLogo.module.scss';
import classNames from 'classnames/bind';
import { WalletName } from '@solana/wallet-adapter-base';
import PhantomLogo from '@/public/logo/phantom.svg';
import SolflareLogo from '@/public/logo/solflare.svg';
import MathWalletLogo from '@/public/logo/math.svg';
import TrustLogo from '@/public/logo/trust.svg';
import CoinbaseLogo from '@/public/logo/coinbase.svg';

const cx = classNames.bind(styles);

type Props = {
  walletName: WalletName;
};

const WalletLogo = ({ walletName }: Props) => {
  switch (walletName) {
    case 'Phantom': {
      return (
        <PhantomLogo viewBox="0 0 1200 1200" className={cx('phantom-logo')} />
      );
    }
    case 'Solflare': {
      return (
        <SolflareLogo viewBox="0 0 248 248" className={cx('solflare-logo')} />
      );
    }
    case 'MathWallet': {
      return (
        <MathWalletLogo
          viewBox="0 0 512.000000 512.000000"
          className={cx('math-logo')}
        />
      );
    }
    case 'Trust': {
      return <TrustLogo viewBox="0 0 542 549" className={cx('trust-logo')} />;
    }
    case 'Coinbase Wallet': {
      return (
        <CoinbaseLogo viewBox="0 0 1024 1024" className={cx('coinbase-logo')} />
      );
    }
    default:
      null;
  }
};

export default WalletLogo;
