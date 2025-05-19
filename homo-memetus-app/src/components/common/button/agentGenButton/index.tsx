import React, { useCallback, MouseEvent, useMemo } from 'react';
import styles from '@/components/common/button/agentGenButton/AgentGenButton.module.scss';
import classNames from 'classnames/bind';
import BaseButton from '@/components/base/button/baseButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnect } from '@/states/partial/wallet/WalletProvider';
import { useDispatch } from 'react-redux';
import { SET_MODAL } from '@/states/global/slice/modal';
import { getCookie } from 'cookies-next';
import { useMutation } from '@tanstack/react-query';
import { MUTATION_KEY } from '@/shared/constants/api';
import { createStrategy } from '@/shared/api/strategy/api';
import { useInput } from '@/states/partial/input/InputContext';
import { SET_TOAST } from '@/states/global/slice/toast';

const cx = classNames.bind(styles);

const AgentGenButton = () => {
  const { value, setValue } = useInput();
  const accessToken = getCookie('accessToken');
  const { connected } = useWallet();
  const { address } = useConnect();
  const dispatch = useDispatch();

  const canEdit = useMemo(() => {
    return connected && address && accessToken;
  }, [connected, address, accessToken]);

  const createStrategyMutation = useMutation({
    mutationKey: [MUTATION_KEY.CREATE_STRATEGY],
    mutationFn: createStrategy,
    onSuccess: (data) => {
      dispatch(
        SET_TOAST({
          type: 'strategy-success',
          canClose: true,
          autoClose: {
            duration: 3000,
          },
        }),
      );
      setValue('');
    },
    onError: () => {
      dispatch(
        SET_TOAST({
          type: 'strategy-fail',
          canClose: true,
          autoClose: {
            duration: 3000,
          },
        }),
      );
    },
  });

  const handleOnClick = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!canEdit) {
        dispatch(SET_MODAL({ key: 'wallet-modal' }));
        return;
      }
      if (value.length === 0) return;
      accessToken &&
        createStrategyMutation.mutate({ contents: value, accessToken });
    },
    [canEdit, value, accessToken, dispatch],
  );
  return (
    <BaseButton
      title="GENERATE STRATEGY"
      type="submit"
      role="button"
      primary={'DARK'}
      secondary={'LIGHT'}
      size="1rem 2rem"
      fontSize={13}
      styleType={'outline'}
      onClick={handleOnClick}
    />
  );
};

export default AgentGenButton;
