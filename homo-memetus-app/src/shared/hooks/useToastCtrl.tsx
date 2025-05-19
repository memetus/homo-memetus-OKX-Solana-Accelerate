import { REMOVE_TOAST } from '@/states/global/slice/toast';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

const useToastCtrl = () => {
  const dispatch = useDispatch();

  const handleCloseToast = useCallback(
    (toastId: string) => {
      dispatch(
        REMOVE_TOAST({
          toastId,
        }),
      );
    },
    [dispatch],
  );

  return {
    handleCloseToast,
  };
};

export default useToastCtrl;
