import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '@/components/common/toast/strategyFailToast/StrategyFailToast.module.scss';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import BaseToast from '@/components/base/toast/baseToast';
import { RootState } from '@/states/global/store';
import { getToastById, REMOVE_TOAST } from '@/states/global/slice/toast';
import FailIcon from '@/public/icon/toast-error.svg';

const cx = classNames.bind(styles);

type Props = {
  toastId: number;
};

const StrategyFailToast = ({ toastId }: Props) => {
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
          <FailIcon viewBox="0 0 32 33" className={cx('icon')} />
        </div>
        <div className={cx('text-wrapper')}>
          <p className={cx('title')}>failed to create</p>
          <p className={cx('desc')}>
            You already use up all ticket available for generating strategies.
          </p>
        </div>
      </div>
    </BaseToast>
  );
};

export default StrategyFailToast;
