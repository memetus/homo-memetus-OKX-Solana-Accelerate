import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/states/global/store';
import { BaseToastType, ToastType } from '@/shared/types/ui/toast';

export type ToastSliceShape = {
  data: BaseToastType[];
  total: number;
};

const initialState: ToastSliceShape = {
  data: [],
  total: 0,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    SET_TOAST: (state, action) => {
      state.total++;
      const newToast: BaseToastType = {
        toastId: state.total,
        index: state.data.length + 1,
        type: action.payload.type,
        canClose: action.payload.canClose,
        autoClose: action.payload.autoClose,
      };

      state.data.push(newToast);
    },
    REMOVE_TOAST: (state, action) => {
      const { toastId } = action.payload;
      const newState: BaseToastType[] = [];

      for (let i = 0; i < state.data.length; i++) {
        if (state.data[i].toastId !== toastId) {
          state.data[i].index = newState.length + 1;
          newState.push(state.data[i]);
        }
      }

      state.data = newState;
    },
  },
});

export const { SET_TOAST, REMOVE_TOAST } = toastSlice.actions;
export const getToast = (state: RootState) => state.toast;
export const getToastById = (state: RootState, toastId: number) => {
  return state.toast.data.find((toast) => toast.toastId === toastId);
};
export const getToastByType = (state: RootState, type: ToastType) => {
  const data = state.toast.data.filter((toast) => toast.type === type);

  return {
    data,
    total: data.length,
  };
};

export default toastSlice.reducer;
