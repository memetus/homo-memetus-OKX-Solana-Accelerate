import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/states/global/store';
import { ModalParamManager, ModalType } from '@/shared/types/ui/modal';

export type Modal = {
  key: ModalType;
  layer?: number;
  params: (typeof ModalParamManager)[ModalType];
};

export type ModalSliceShape = {
  display: boolean;
  modal: Modal[];
};

const initialState: ModalSliceShape = {
  display: false,
  modal: [],
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    HIDE_MODAL: (state) => {
      state.display = false;
    },
    SHOW_MODAL: (state) => {
      state.display = true;
    },
    SET_MODAL: (state, action) => {
      const { key, layer, params } = action.payload;
      state.modal.push({ key, layer: layer ?? 0, params });
      state.display = true;
    },
    CLOSE_MODAL: (state, action) => {
      const { key } = action.payload;
      state.modal = state.modal.filter((modal) => modal.key !== key);
      if (state.modal.length === 0) {
        state.display = false;
      }
    },
    SET_TOP_LAYER: (state, action) => {
      const { key } = action.payload;
      const modal = state.modal.find((modal) => modal.key === key);
      if (modal) {
        const rest = state.modal.filter((modal) => modal.key !== key);
        state.modal = [modal, ...rest];
      }
    },
    CLEAR_ALL_MODAL: (state) => {
      state.modal = [];
      state.display = false;
    },
  },
});

export const { SET_MODAL, CLOSE_MODAL, SET_TOP_LAYER, CLEAR_ALL_MODAL } =
  modalSlice.actions;

export const getModalList = (state: RootState) => state.modal.modal;
export const getModalDisplay = (state: RootState) => state.modal.display;
export const getTopModal = (state: RootState) => {
  if (state.modal.modal && state.modal.modal.length !== 0) {
    return state.modal.modal[0];
  }
};
export const getModal = (state: RootState, key: ModalType) => {
  return state.modal.modal.find((modal) => modal.key === key);
};

export default modalSlice.reducer;
