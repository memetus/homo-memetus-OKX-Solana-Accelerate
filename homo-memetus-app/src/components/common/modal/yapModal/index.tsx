import React, { useRef } from 'react';
import styles from '@/components/common/modal/yapModal/YapModal.module.scss';
import classNames from 'classnames/bind';
import { ModalParamManager } from '@/shared/types/ui/modal';
import BaseModal from '@/components/base/modal/baseModal';
import { useOnClick } from '@/shared/hooks/useOnClick';
import useModalCtrl from '@/shared/hooks/useModalCtrl';

const cx = classNames.bind(styles);

type Props = {
  params: (typeof ModalParamManager)['yap-modal'];
};

const YapModal = ({ params }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { handleCloseModal } = useModalCtrl();

  useOnClick({
    ref: modalRef,
    handler: () => handleCloseModal('yap-modal'),
    mouseEvent: 'click',
  });

  return (
    <BaseModal>
      <div className={cx('modal-wrapper')}>
        <div className={cx('modal')}>
          <div className={cx('modal-inner')}>
            <h2 className={cx('modal-title')}>${params.symbol}</h2>
            <div className={cx('agent-wrapper')}>
              <span className={cx('label-text')}>Agent: </span>
              <span className={cx('name-text')}>{params.name}</span>
            </div>
            <div className={cx('content-wrapper')}>
              <span className={cx('label-text')}>Rationale: </span>
              <span className={cx('content-text')}>{params.content}</span>
            </div>
            <button
              className={cx('button')}
              onClick={() => handleCloseModal('yap-modal')}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default YapModal;
