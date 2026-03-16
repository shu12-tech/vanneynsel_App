import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL, GET_ME, LOGIN_ENDPOINT } from '../constants/api';

// Define interfaces for type safety
export interface AuthState {
  email: string;
  token: string | null;
  expiry: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  success: boolean;
  user: User | null; // Added user field
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  expiry: number;
}

interface DecodedToken {
  exp: number;
}

interface User {
  id: string;
  username: string;
  display_name: string;
  role_id: string;
  permissions: string[];
  group_id: string;
  memory_enabled: boolean;
  is_active: boolean;
  expiry_date: string;
}

// Async Thunk for Login API
export const login = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const token = data.token;

      // Decode JWT to extract expiry
      const decoded: DecodedToken = jwtDecode(token);
      const expiry = decoded.exp * 1000;

      return { token, expiry };
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue((error as Error).message || 'Network error');
    }
  }
);

// Async Thunk for Get Me API
export const getMe = createAsyncThunk<
  User,
  void,
  { rejectValue: string; state: { auth: AuthState } }
>(
  'auth/getMe',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        return rejectWithValue('No token available');
      }

      const response = await fetch(`${API_BASE_URL}${GET_ME}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData)
        return rejectWithValue(errorData.message || 'Failed to fetch user data');
      }

      const user: User = await response.json();
      console.log('Fetched user data:', user);
      return user;
    } catch (error) {
      console.error('Get Me error:', error);
      return rejectWithValue((error as Error).message || 'Network error');
    }
  }
);

// Initial State
const initialState: AuthState = {
  email: '',
  token: null,
  expiry: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  success: false,
  user: null, // Added user field
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.success = false;
    },
    logout: (state) => {
      state.token = null;
      state.expiry = null;
      state.isAuthenticated = false;
      state.email = '';
      state.success = false;
      state.user = null; // Clear user on logout
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.success = true;
        state.token = action.payload.token;
        state.expiry = action.payload.expiry;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
        state.success = false;
      })
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.email = action.payload.username; // Optionally set email from username
      })
      .addCase(getMe.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const { clearError, logout, setEmail } = authSlice.actions;
export default authSlice.reducer;