import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'van' | 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  systemTheme: boolean;
}

const initialState: ThemeState = {
  theme: 'van',
  systemTheme: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    setSystemTheme: (state, action: PayloadAction<boolean>) => {
      state.systemTheme = action.payload;
    },
  },
});

export const { setTheme,setSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
