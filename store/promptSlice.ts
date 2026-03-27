import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_BASE_URL, GET_CHAT_HISTORY } from "../constants/api";
import { RootState } from "./index";

export interface Message {
  role: "user" | "assistant";
  text: string;
}

export interface PromptState {
  prompt: string;
  messages: Message[];
  loading: boolean;
  error: string | null;
  ask: string | null;
}

const initialState: PromptState = {
  prompt: "",
  messages: [],
  loading: false,
  error: null,
  ask: null,
};

export const getMessages = createAsyncThunk<
  Message[],
  void,
  { rejectValue: string; state: RootState }
>("prompt/getMessages", async (_, { getState, rejectWithValue }) => {
  try {
    const { auth, session } = getState();
    if (!auth.token || !auth.user?.username || !session.currentSession) {
      return rejectWithValue("Missing authentication or session information");
    }

    const response = await fetch(
      `${API_BASE_URL}${GET_CHAT_HISTORY}/${auth.user.username}/${session.currentSession.session_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.message || "Failed to fetch messages");
    }

    const messages: Message[] = await response.json();
    return messages;
  } catch (error) {
    console.error("Get Messages error:", error);
    return rejectWithValue((error as Error).message || "Network error");
  }
});

const promptSlice = createSlice({
  name: "prompt",
  initialState,
  reducers: {
    setPrompt(state, action: PayloadAction<string>) {
      state.prompt = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    updateLastMessage(state, action: PayloadAction<string>) {
      const lastIndex = state.messages.length - 1;
      if (lastIndex >= 0 && state.messages[lastIndex].role === "assistant") {
        state.messages[lastIndex].text = action.payload;
      }
    },
    setAsk(state, action: PayloadAction<string | null>) {
      state.ask = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getMessages.fulfilled,
        (state, action: PayloadAction<Message[]>) => {
          state.loading = false;
          state.messages = action.payload;
        },
      )
      .addCase(
        getMessages.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Unknown error";
        },
      );
  },
});

export const {
  setPrompt,
  addMessage,
  updateLastMessage,
  clearMessages,
  setAsk,
} = promptSlice.actions;
export default promptSlice.reducer;
