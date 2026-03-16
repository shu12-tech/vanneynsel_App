import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import authReducer, { AuthState } from './authSlice';
import promptReducer, { PromptState } from './promptSlice';
import sessionReducer, { SessionState } from './sessionSlice';
import themeReducer from './themeSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['theme'], // We only want to persist the theme
};

const rootReducer = combineReducers({
  auth: authReducer,
  prompt: promptReducer,
  session: sessionReducer,
  theme: themeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Define the root state type
export interface RootState {
  auth: AuthState;
  prompt: PromptState;
  session: SessionState;
  theme: { theme: 'van' | 'light' | 'dark'; systemTheme: boolean };
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Export the typed dispatch
export type AppDispatch = typeof store.dispatch;

// Export the store's getState type
export type RootStateType = ReturnType<typeof store.getState>;