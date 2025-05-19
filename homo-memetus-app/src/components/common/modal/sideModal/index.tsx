import BaseModal from '@/components/base/modal/baseModal';
import { ModalParamManager } from '@/shared/types/ui/modal';
import React, { useCallback, useRef, useState } from 'react';
import styles from '@/components/common/modal/sideModal/SideModal.module.scss';
import classNames from 'classnames/bind';
import { useOnClick } from '@/shared/hooks/useOnClick';
import BaseLogo from '@/components/common/logo/baseLogo';
import Link from 'next/link';
import ConnectButton from '@/components/common/button/connectButton';
import CloseIcon from '@/public/icon/close-icon.svg';
import useModalCtrl from '@/shared/hooks/useModalCtrl';
import UseCountBadge from '@/components/common/badge/useCountBadge';
import ButtonBadge from '@/components/common/badge/buttonBadge';
import { useRouter } from 'next/navigation';

const cx = classNames.bind(styles);

type Props = {
  params: (typeof ModalParamManager)['side-modal'];
};

const SideModal = ({ params }: Props) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(true);
  const { handleCloseModal } = useModalCtrl();

  useOnClick({
    ref: modalRef,
    handler: () => handleCloseModal('side-modal'),
    mouseEvent: 'click',
  });

  return (
    <BaseModal>
      <div className={cx('modal-wrapper')}>
        <div className={cx('modal', { open, close: !open })} ref={modalRef}>
          <div
            className={cx('logo-wrapper')}
            onClick={(e) => {
              handleCloseModal('side-modal');
              router.replace('/');
            }}
          >
            <BaseLogo />
          </div>
          <nav className={cx('nav-container')}>
            <Link
              href={'/theory-of-aivolution'}
              onClick={(e) => {
                handleCloseModal('side-modal');
              }}
            >
              <div className={cx('nav-text-wrapper')}>
                <span className={cx('nav-text')}>Theory of AIvolution</span>
              </div>
            </Link>
            <div className={cx('nav-text')}>
              <span className={cx('nav-text')}>Building in Public</span>
              <Link
                href={'/building-in-public'}
                onClick={(e) => {
                  handleCloseModal('side-modal');
                }}
              >
                <div className={cx('nav-text-small')} style={{ marginTop: 20 }}>
                  <span className={cx('nav-text')}>
                    Step 1: Ask Agent Anything
                  </span>
                </div>
              </Link>
              <Link
                href={'/building-in-public'}
                onClick={(e) => {
                  handleCloseModal('side-modal');
                }}
              >
                <div className={cx('nav-text-small')}>
                  <span className={cx('nav-text')}>
                    Step 2: Best VIRTual Practice Dashboard{' '}
                  </span>
                </div>
              </Link>
              <Link
                href={'/agent-terminal'}
                onClick={(e) => {
                  handleCloseModal('side-modal');
                }}
              >
                <div className={cx('nav-text-small')}>
                  <span className={cx('nav-text')}>Step 3: Survival Begin</span>
                </div>
              </Link>
            </div>
          </nav>
          <div className={cx('sub-nav')}>
            <ButtonBadge type="telegram" url="https://t.me/+hozckWtCuYw4MzVl" />
            <ButtonBadge type="twitter" url="https://x.com/homo_memetus" />
            <ButtonBadge
              type="dexscreener"
              url="https://dexscreener.com/solana/9czr2mvyxgpcndrba7ywaqg3k1fgckcqybwsbkxnmjfs"
            />
          </div>
          <div className={cx('button-wrapper')}>
            <UseCountBadge />
            <ConnectButton />
          </div>
          <button
            className={cx('close-button')}
            aria-label="sidebar-open-button"
            onClick={() => {
              setOpen(false);
              setTimeout(() => {
                handleCloseModal('side-modal');
              }, 500);
            }}
          >
            <CloseIcon viewBox="0 0 24 24" className={cx('close-icon')} />
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default SideModal;
