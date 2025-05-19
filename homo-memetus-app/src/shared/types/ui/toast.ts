import { ReactNode } from 'react';

export type ToastType = 'strategy-success' | 'strategy-fail';

export type BaseToastType = {
  toastId: number;
  index: number;
  type: ToastType;
  canClose: boolean;
  autoClose: {
    duration: number;
  } | null;
  children?: ReactNode;
};
