import { CLOSE_MODAL } from '@/states/global/slice/modal';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ModalType } from '@/shared/types/ui/modal';

const useModalCtrl = () => {
  const dispatch = useDispatch();

  const handleCloseModal = useCallback(
    (key: ModalType, delay?: number) => {
      setTimeout(() => {
        dispatch(CLOSE_MODAL({ key }));
      }, delay ?? 0);
    },
    [dispatch],
  );
  return {
    handleCloseModal,
  };
};

export default useModalCtrl;
