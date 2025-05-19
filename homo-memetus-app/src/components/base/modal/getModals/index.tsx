import AccountModal from '@/components/common/modal/accountModal';
import WalletModal from '@/components/common/modal/walletModal';
import { ModalParamManager, ModalType } from '@/shared/types/ui/modal';
import React, { ReactNode } from 'react';

type Props = {
  modalName: ModalType;
  modalParams: (typeof ModalParamManager)[ModalType];
};

const GetModals = ({ modalName, modalParams }: Props) => {
  switch (modalName) {
    case 'account-modal': {
      return <AccountModal params={modalParams} />;
    }
    case 'wallet-modal': {
      return <WalletModal params={modalParams} />;
    }
    default: {
      null;
    }
  }
};

export default GetModals;
