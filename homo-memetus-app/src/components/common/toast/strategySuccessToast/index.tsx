import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '@/components/common/toast/strategySuccessToast/StrategySuccessToast.module.scss';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { getToastById, REMOVE_TOAST } from '@/states/global/slice/toast';
import { RootState } from '@/states/global/store';
import BaseToast from '@/components/base/toast/baseToast';
import SuccessIcon from '@/public/icon/toast-success.svg';

const cx = classNames.bind(styles);

type Props = {
  toastId: number;
};

const StrategySuccessToast = ({ toastId }: Props) => {
  const toast = useSelector((state: RootState) => getToastById(state, toastId));
  const [hide, setHide] = useState<boolean>(false);
  const dispatch = useDispatch();

  const handleClose = useCallback(() => {
    setHide(true);
    setTimeout(() => {
      dispatch(
        REMOVE_TOAST({
          toastId,
        }),
      );
    }, 500);
  }, [dispatch, toastId]);

  useEffect(() => {
    if (toast && toast?.autoClose !== null) {
      setTimeout(() => {
        handleClose();
      }, toast.autoClose.duration);
    }
  }, [toastId]);

  const isFirst = useMemo(() => toast?.index === 1, [toast?.index]);

  if (!toast) return null;

  return (
    <BaseToast
      toastId={toastId}
      index={toast.index}
      type={toast.type}
      canClose={toast.canClose}
      autoClose={toast.autoClose}
    >
      <div
        className={cx('toast', hide && 'toast-hide')}
        style={{
          transition: 'bottom 0.4s',
          bottom: `${
            isFirst ? toast.index * 20 : (toast.index + 1) * 20 - 20
          }px`,
        }}
      >
        <div className={cx('icon-wrapper')}>
          <SuccessIcon viewBox="0 0 32 33" className={cx('icon')} />
        </div>
        <div className={cx('text-wrapper')}>
          <p className={cx('title')}>successfully craeted</p>
          <p className={cx('desc')}>
            Your strategy has been successfully created.
          </p>
        </div>
      </div>
    </BaseToast>
  );
};

export default StrategySuccessToast;
