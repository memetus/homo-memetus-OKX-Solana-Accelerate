/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/components/common/button/connectButton/ConnectButton.module.scss';
import classNames from 'classnames/bind';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnect } from '@/states/partial/wallet/WalletProvider';
import { WalletName } from '@solana/wallet-adapter-base';
import WalletLogo from '@/components/base/logo/walletLogo';
import { getShortenAddr } from '@/shared/utils/format';
import { useDispatch } from 'react-redux';
import { SET_MODAL } from '@/states/global/slice/modal';
import Image from 'next/image';
import SampleProfile from '@/public/sample/sample-profile.png';
import { useOnClick } from '@/shared/hooks/useOnClick';

const cx = classNames.bind(styles);

const ConnectButton = () => {
  const dispatch = useDispatch();
  const { select, disconnect, connect, connected } = useWallet();
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const { wallet, wallets, address, canConnect, setCanConnect } = useConnect();

  const handleWalletSelect = useCallback(
    async (walletName: WalletName) => {
      try {
        setCanConnect(true);
        select(walletName);
        wallet && connect();
        setOpen(false);
      } catch (error) {
        console.log('wallet connection err : ', error);
      }
    },
    [wallets, wallet, address, canConnect],
  );

  useOnClick({ ref, handler: () => setOpen(false), mouseEvent: 'click' });

  return (
    <div className={cx('connect-button-dropdown')} ref={ref}>
      <button
        className={cx('connect-button-container')}
        onClick={() => {
          if (connected) {
            dispatch(SET_MODAL({ key: 'account-modal', params: {} }));
          } else {
            setOpen(!open);
          }
        }}
      >
        {/* {connected && address && (
          <div className={cx("account-image-wrapper")}>
            <Image
              src={SampleProfile}
              alt={"user"}
              fill
              priority
              quality={100}
              className={cx("account-image")}
            />
          </div>
        )} */}
        <span className={cx('connect-button-text')}>
          {connected && address
            ? `${getShortenAddr(address)}`
            : 'Connect Wallet'}
        </span>
      </button>
      {open && (
        <div className={cx('connect-button-list-wrapper')}>
          {wallets.map((wallet) => {
            return (
              <button
                key={wallet.name}
                className={cx('connect-button-item')}
                onClick={() => {
                  handleWalletSelect(wallet.name);
                }}
              >
                <WalletLogo walletName={wallet.name} />
                <span className={cx('connect-button-item-text')}>
                  {wallet.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConnectButton;
