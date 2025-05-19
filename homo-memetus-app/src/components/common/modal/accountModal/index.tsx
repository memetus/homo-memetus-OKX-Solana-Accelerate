import React, { MouseEvent, useCallback, useRef } from 'react';
import styles from '@/components/common/modal/accountModal/AccountModal.module.scss';
import classNames from 'classnames/bind';
import { ModalParamManager } from '@/shared/types/ui/modal';
import BaseModal from '@/components/base/modal/baseModal';
import { useOnClick } from '@/shared/hooks/useOnClick';
import { useConnect } from '@/states/partial/wallet/WalletProvider';
import { getShortenAddr } from '@/shared/utils/format';
import WalletLogo from '@/components/base/logo/walletLogo';
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import SampleProfile from '@/public/sample/sample-profile.png';
import CopyIcon from '@/public/icon/copy-icon.svg';
import CopyCheckIcon from '@/public/icon/copy-check-icon.svg';
import { useCopy } from '@/shared/hooks/useCopy';
import { deleteCookie } from 'cookies-next';
import useModalCtrl from '@/shared/hooks/useModalCtrl';
import { useMutation } from '@tanstack/react-query';
import { MUTATION_KEY } from '@/shared/constants/api';
import { deleteJwtCookie } from '@/shared/api/users/api';

const cx = classNames.bind(styles);

type Props = {
  params: (typeof ModalParamManager)['account-modal'];
};

const AccountModal = ({ params }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { disconnect, wallet } = useWallet();
  const { address, wallet: walletName } = useConnect();
  const { isCopied, textCopy } = useCopy();
  const { handleCloseModal } = useModalCtrl();

  useOnClick({
    ref: modalRef,
    handler: () => handleCloseModal('account-modal'),
    mouseEvent: 'click',
  });

  const handleCopy = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      address && textCopy(address);
    },
    [address],
  );

  const deleteCookieMutation = useMutation({
    mutationKey: [MUTATION_KEY.DELETE_COOKIE],
    mutationFn: deleteJwtCookie,
    onSuccess: () => {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
  });
  return (
    <BaseModal>
      <div className={cx('modal-wrapper')}>
        <div className={cx('modal')} ref={modalRef}>
          <div className={cx('account-image-wrapper')}>
            <Image
              src={SampleProfile}
              alt={'user'}
              fill
              priority
              quality={100}
              className={cx('account-image')}
            />
          </div>
          <div className={cx('account-info-wrapper')}>
            <div className={cx('account-item')}>
              <span className={cx('account-item-text')}>
                {address && getShortenAddr(address, 12)}
              </span>
              <button className={cx('copy-button')} onClick={handleCopy}>
                {isCopied ? (
                  <CopyCheckIcon
                    viewBox="0 0 24 24"
                    className={cx('copy-button-icon')}
                  />
                ) : (
                  <CopyIcon
                    viewBox="0 0 24 24"
                    className={cx('copy-button-icon')}
                  />
                )}
              </button>
            </div>
            <div className={cx('wallet-item')}>
              <span className={cx('wallet-item-text')}>{walletName}</span>
              {walletName && <WalletLogo walletName={walletName} />}
            </div>
            <div className={cx('button-wrapper')}>
              <button
                className={cx('button')}
                onClick={() => {
                  disconnect();
                  disconnect();
                  wallet?.adapter.disconnect();
                  wallet?.adapter.disconnect();
                  wallet?.adapter.disconnect();
                  deleteCookie('accessToken');
                  deleteCookie('accessToken');
                  deleteCookie('accessToken');
                  deleteCookie('accessToken');
                  handleCloseModal('account-modal');
                  deleteCookieMutation.mutate();
                }}
              >
                <span className={cx('button-text')}>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default AccountModal;
