import BaseModal from '@/components/base/modal/baseModal';
import styles from '@/components/common/modal/walletModal/WalletModal.module.scss';
import classNames from 'classnames/bind';
import { useOnClick } from '@/shared/hooks/useOnClick';
import { ModalParamManager } from '@/shared/types/ui/modal';
import React, { useCallback, useRef } from 'react';
import { useConnect } from '@/states/partial/wallet/WalletProvider';
import WalletLogo from '@/components/base/logo/walletLogo';
import { useWallet } from '@solana/wallet-adapter-react';
import useModalCtrl from '@/shared/hooks/useModalCtrl';

const cx = classNames.bind(styles);

type Props = {
  params: (typeof ModalParamManager)['wallet-modal'];
};

const WalletModal = ({ params }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { wallet, wallets, setWallet } = useConnect();
  const { select, connect } = useWallet();
  const { handleCloseModal } = useModalCtrl();

  const handleConnect = useCallback(() => {
    try {
      wallet && connect();
    } catch (error) {
      console.log('wallet connection err : ', error);
    } finally {
      handleCloseModal('wallet-modal')
    }
  }, [wallet]);

  useOnClick({
    ref: modalRef,
    handler: () => handleCloseModal('wallet-modal'),
    mouseEvent: 'click',
  });

  return (
    <BaseModal>
      <div className={cx('modal-wrapper')}>
        <div className={cx('modal')} ref={modalRef}>
          <span className={cx('modal-title')}>Connect Wallet</span>
          <div className={cx('wallet-list')}>
            {wallets.map((item, index) => {
              return (
                <button
                  key={item.name}
                  className={cx('wallet-item', {
                    selected: item.name === wallet,
                  })}
                  onClick={() => {
                    select(item.name);
                    setWallet(item.name);
                  }}
                >
                  <WalletLogo walletName={item.name} />
                  <span className={cx('wallet-name')}>{item.name}</span>
                </button>
              );
            })}
          </div>
          <button className={cx('connect-button')} onClick={handleConnect}>
            <span className={cx('button-text')}>Connect {wallet}</span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default WalletModal;
