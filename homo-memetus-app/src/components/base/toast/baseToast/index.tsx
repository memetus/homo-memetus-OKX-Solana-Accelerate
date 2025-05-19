import styles from '@/components/base/toast/baseToast/BaseToast.module.scss';
import classNames from 'classnames/bind';
import { BaseToastType } from '@/shared/types/ui/toast';
import ReactDOM from 'react-dom';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { REMOVE_TOAST } from '@/states/global/slice/toast';

const cx = classNames.bind(styles);

type Props = BaseToastType;

const BaseToast = ({
  toastId,
  index,
  type,
  canClose,
  autoClose,
  children,
}: Props) => {
  return ReactDOM.createPortal(
    <div className={cx('toast-container')}>{children}</div>,
    document.getElementById('toast-root') as HTMLElement,
  );
};

export default BaseToast;
