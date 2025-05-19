export type ModalType =
  | 'account-modal'
  | 'wallet-modal'
  | 'side-modal'
  | 'buildingpublic-modal'
  | 'yap-modal'
  | 'filter-agent-modal'
  | 'agent-bar-modal'
  | 'top-picks-modal';

export const ModalParamManager = {
  'account-modal': {},
  'wallet-modal': {},
  'side-modal': {},
  'buildingpublic-modal': {},
  'yap-modal': {
    name: '',
    symbol: '',
    content: '',
  },
  'filter-agent-modal': {},
  'agent-bar-modal': {},
  'top-picks-modal': {},
};

export type ModalShape = {
  key: ModalType;
  params: (typeof ModalParamManager)[ModalType];
};
