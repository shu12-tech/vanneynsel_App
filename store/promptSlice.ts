import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_BASE_URL, GET_CHAT_HISTORY } from "../constants/api";
import { RootState } from "./index";

export interface Message {
  id?: string | null;
  role: "user" | "assistant";
  text: string;
  status?: string | null;
  client_turn_id?: string | null;
  feedback?: any;
}

export interface PromptState {
  prompt: string;
  messages: Message[];
  loading: boolean;
  error: string | null;
  ask: string | null;
  currentStatus: string;
}

const initialState: PromptState = {
  prompt: "",
  messages: [],
  loading: false,
  error: null,
  ask: null,
  currentStatus: "",
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

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    const messages: Message[] = data.map((item: any) => ({
      id: item?.id ?? null,
      role: (item?.role === "user" ? "user" : "assistant") as
        | "user"
        | "assistant",
      text: item?.text ?? item?.message ?? "",
      status: null,
      client_turn_id: item?.client_turn_id ?? null,
      feedback: item?.feedback ?? null,
    }));

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

    setCurrentStatus(state, action: PayloadAction<string>) {
      state.currentStatus = action.payload;
    },

    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },

    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },

    addUserMessage(state, action: PayloadAction<string>) {
      state.messages.push({
        role: "user",
        text: action.payload,
      });
    },

    updateLastMessage(state, action: PayloadAction<string>) {
      const lastIndex = state.messages.length - 1;

      if (lastIndex >= 0 && state.messages[lastIndex].role === "assistant") {
        state.messages[lastIndex].text = action.payload;
        state.messages[lastIndex].status = null;
      } else {
        state.messages.push({
          id: null,
          role: "assistant",
          text: action.payload,
          status: null,
          client_turn_id: null,
          feedback: null,
        });
      }
    },

    appendToAssistantMessage(
      state,
      action: PayloadAction<{
        text: string;
        client_turn_id?: string | null;
      }>,
    ) {
      const { text, client_turn_id } = action.payload;

      if (!text) return;

      const assistantMessage = state.messages.find(
        (msg) =>
          msg.role === "assistant" && msg.client_turn_id === client_turn_id,
      );

      if (!assistantMessage) {
        state.messages.push({
          id: null,
          role: "assistant",
          text,
          status: null,
          client_turn_id: client_turn_id ?? null,
          feedback: null,
        });
        return;
      }

      assistantMessage.text = (assistantMessage.text || "") + text;
      assistantMessage.status = null;
    },

    finalizeAssistantMessage(
      state,
      action: PayloadAction<{
        client_turn_id?: string | null;
        id?: string | null;
        text?: string;
      }>,
    ) {
      const { client_turn_id, id, text } = action.payload;

      if (client_turn_id) {
        const targetIndex = state.messages.findIndex(
          (msg) =>
            msg.role === "assistant" && msg.client_turn_id === client_turn_id,
        );

        if (targetIndex >= 0) {
          if (id !== undefined) {
            state.messages[targetIndex].id = id;
          }

          state.messages[targetIndex].status = null;

          if (
            typeof text === "string" &&
            text.trim() &&
            !state.messages[targetIndex].text.trim()
          ) {
            state.messages[targetIndex].text = text;
          }

          return;
        }
      }

      if (typeof text === "string" && text.trim()) {
        state.messages.push({
          id: id ?? null,
          role: "assistant",
          text,
          status: null,
          client_turn_id: client_turn_id ?? null,
          feedback: null,
        });
      }
    },

    setMessageFeedback(
      state,
      action: PayloadAction<{
        messageId: string;
        feedback: any;
      }>,
    ) {
      const target = state.messages.find(
        (msg) => String(msg.id) === String(action.payload.messageId),
      );

      if (target) {
        target.feedback = action.payload.feedback;
      }
    },

    setAsk(state, action: PayloadAction<string | null>) {
      state.ask = action.payload;
    },

    clearMessages(state) {
      state.messages = [];
      state.currentStatus = "";
    },

    clearPromptError(state) {
      state.error = null;
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
  setCurrentStatus,
  setMessages,
  addMessage,
  addUserMessage,
  updateLastMessage,
  appendToAssistantMessage,
  finalizeAssistantMessage,
  setMessageFeedback,
  clearMessages,
  setAsk,
  clearPromptError,
} = promptSlice.actions;

export default promptSlice.reducer;
/*import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
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
export default promptSlice.reducer;*/
