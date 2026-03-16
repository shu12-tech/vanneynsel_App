import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AGENT_ID, API_BASE_URL, CREATE_SESSION, DELETE_SESSION, SESSIONS } from '../constants/api';
import { RootState } from './index';

// Define interfaces for type safety
export interface Session {
  session_id: string;
  name: string;
  created_at: string;
  // Add other session properties as needed
}

export interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
}

interface CreateSessionPayload {
  name: string;
}

// Async Thunk for Get Sessions API
export const getSessions = createAsyncThunk<
  Session[],
  void,
  { rejectValue: string; state: RootState }
>(
  'sessions/getSessions',
  async (_, { getState, rejectWithValue }) => {

    try {
      const { auth } = getState();
      if (!auth.token || !auth.user?.username) {
        return rejectWithValue('No token or user email available');
      }

      const response = await fetch(`${API_BASE_URL}${SESSIONS}/${auth.user.username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });


      if (!response.ok) {
        const errorData = await response.json();
        console.log('Get Sessions error response:', errorData);
        return rejectWithValue(errorData.message || 'Failed to fetch sessions');
      }

      const data = await response.json();
      const sessions: Session[] = data.sessions;

      return sessions;
    } catch (error) {
      console.error('Get Sessions error:', error);
      return rejectWithValue((error as Error).message || 'Network error');
    }
  }
);

// Async Thunk for Create Session API
export const createSession = createAsyncThunk<
  Session,
  void,
  { rejectValue: string; state: RootState }
>(
  'sessions/createSession',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth, prompt } = getState();
      if (!auth.token || !auth.user?.username) {
        return rejectWithValue('No token or user email available');
      }

      const response = await fetch(`${API_BASE_URL}${CREATE_SESSION}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: auth.user.username,
          name: prompt.prompt.substring(0, 100),
          agent_id: AGENT_ID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create session');
      }

      const newSession: Session = await response.json();
      return newSession;
    } catch (error) {
      console.error('Create Session error:', error);
      return rejectWithValue((error as Error).message || 'Network error');
    }
  }
);

// Async Thunk for Delete Session API
export const deleteSession = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>(
  'sessions/deleteSession',
  async (sessionId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token || !auth.user?.username) {
        return rejectWithValue('No token or user available');
      }

      const response = await fetch(`${API_BASE_URL}${DELETE_SESSION}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId, username: auth.user.username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete session');
      }

      return sessionId;
    } catch (error) {
      console.error('Delete Session error:', error);
      return rejectWithValue((error as Error).message || 'Network error');
    }
  }
);

// Initial State
const initialState: SessionState = {
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
};

// Slice
const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSession: (state, action: PayloadAction<Session>) => {
      state.currentSession = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSessions.fulfilled, (state, action: PayloadAction<Session[]>) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(getSessions.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      })
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action: PayloadAction<Session>) => {
        state.loading = false;
        state.sessions.push(action.payload);
        state.currentSession = action.payload;
        console.log('New session created and set as current:', action.payload);
      })
      .addCase(createSession.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      })
      .addCase(deleteSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSession.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.sessions = state.sessions.filter(
          (session) => session.session_id !== action.payload
        );
      })
      .addCase(deleteSession.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const { clearError, setCurrentSession } = sessionSlice.actions;
export default sessionSlice.reducer;
