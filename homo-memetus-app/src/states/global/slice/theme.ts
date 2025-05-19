import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/states/global/store';
import { ThemeType } from '@/shared/types/etc/theme';

export type ThemeSliceShape = {
  theme: ThemeType;
};

const initialState: ThemeSliceShape = {
  theme: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    SET_THEME: (state, action) => {
      state.theme = action.payload.theme;
    },
  },
});

export const { SET_THEME } = themeSlice.actions;
export const getTheme = (state: RootState) => state.theme.theme;

export default themeSlice.reducer;
