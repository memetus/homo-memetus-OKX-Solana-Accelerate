'use client';
import LayoutWrapper from '@/components/layout/wrapper';
import React, {
  Fragment,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { ThemeType } from '@/shared/types/etc/theme';
import { useSelector } from 'react-redux';
import { getModal } from '@/states/global/slice/modal';
import { RootState } from '@/states/global/store';
import WalletModal from '@/components/common/modal/walletModal';
import AccountModal from '@/components/common/modal/accountModal';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMutation } from '@tanstack/react-query';
import { MUTATION_KEY } from '@/shared/constants/api';
import { userLogin } from '@/shared/api/users/api';
import { UserLoginResponse } from '@/shared/types/data/api.type';
import { useConnect } from '@/states/partial/wallet/WalletProvider';
import { getTimezone } from '@/shared/utils/etc';
import SideModal from '@/components/common/modal/sideModal';
import { getToast } from '@/states/global/slice/toast';
import StrategyFailToast from '@/components/common/toast/strategyFailToast';
import StrategySuccessToast from '@/components/common/toast/strategySuccessToast';
import { BaseToastType } from '@/shared/types/ui/toast';

type Props = {
  children: ReactNode;
  jwt: string | undefined;
};

const AppProvider = ({ children, jwt }: Props) => {
  const theme = getCookie('theme') as ThemeType;
  const { connected, connecting, wallet } = useWallet();
  const { address } = useConnect();
  const toastList = useSelector(getToast);
  const walletModal = useSelector((state: RootState) =>
    getModal(state as RootState, 'wallet-modal'),
  );
  const accountModal = useSelector((state: RootState) =>
    getModal(state as RootState, 'account-modal'),
  );
  const sideModal = useSelector((state: RootState) =>
    getModal(state as RootState, 'side-modal'),
  );

  const loginMutation = useMutation({
    mutationKey: [MUTATION_KEY.LOGIN],
    mutationFn: userLogin,
    onSuccess: (data: UserLoginResponse | Error) => {
      if (data instanceof Error) {
        console.log('login error : ', data);
      } else {
        setCookie('accessToken', data.accessToken);
      }
    },
  });

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme ? theme : 'dark');
  }, []);

  useEffect(() => {
    const accessToken = getCookie('accessToken');

    if (connected && address && !accessToken && wallet && !connecting) {
      loginMutation.mutate({ wallet: address, timezone: getTimezone() });
    } else {
      if (accessToken && !connected && !connecting && !address) {
        deleteCookie('accessToken');
      }
      // if (!connected && !connecting && address === null) {
      //   dispatch(SET_MODAL({ key: "wallet-modal", params: {} }));
      // }
    }
  }, [connected, address, connecting, wallet]);

  const successList = useMemo(() => {
    return toastList.data.filter((toast) => toast.type === 'strategy-success');
  }, [toastList]);

  const failList = useMemo(() => {
    return toastList.data.filter((toast) => toast.type === 'strategy-fail');
  }, [toastList]);

  return (
    <Fragment>
      <LayoutWrapper>{children}</LayoutWrapper>
      {accountModal && accountModal.key === 'account-modal' && (
        <AccountModal params={accountModal.params} />
      )}
      {walletModal && walletModal.key === 'wallet-modal' && (
        <WalletModal params={walletModal.params} />
      )}
      {sideModal && sideModal.key === 'side-modal' && (
        <SideModal params={sideModal.params} />
      )}

      {failList.map((toast: BaseToastType) => {
        return (
          <StrategyFailToast key={toast.toastId} toastId={toast.toastId} />
        );
      })}
      {successList.map((toast: BaseToastType) => {
        return (
          <StrategySuccessToast key={toast.toastId} toastId={toast.toastId} />
        );
      })}
    </Fragment>
  );
};

export default AppProvider;
