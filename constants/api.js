export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

export const LOGIN_ENDPOINT = "/login";
export const GET_ME = "/me";

export const SESSIONS = "/sessions";
export const CREATE_SESSION = "/create_session";
export const DELETE_SESSION = "/delete_session";
export const CONVERSATION_HISTORY = "/conversation_history";
export const GET_CHAT_HISTORY = "/chats";
export const SUBMIT_FEEDBACK = "/messages/feedback";

export const AGENT_ID = process.env.EXPO_PUBLIC_AGENT_ID || "";

export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_BASE_URL || "";

export const getLoginUrl = () => `${API_BASE_URL}${LOGIN_ENDPOINT}`;

export const getMeUrl = () => `${API_BASE_URL}${GET_ME}`;

export const getSessionsUrl = (username) =>
  `${API_BASE_URL}${SESSIONS}/${encodeURIComponent(username)}`;

export const getCreateSessionUrl = () => `${API_BASE_URL}${CREATE_SESSION}`;

export const getDeleteSessionUrl = () => `${API_BASE_URL}${DELETE_SESSION}`;

export const getConversationHistoryUrl = (sessionId) =>
  `${API_BASE_URL}${CONVERSATION_HISTORY}/${encodeURIComponent(sessionId)}`;

export const getChatHistoryUrl = (username, sessionId) =>
  `${API_BASE_URL}${GET_CHAT_HISTORY}/${encodeURIComponent(
    username,
  )}/${encodeURIComponent(sessionId)}`;

export const getFeedbackUrl = () => `${API_BASE_URL}${SUBMIT_FEEDBACK}`;

export const getWsUrl = (username, sessionId, token) =>
  `${WS_BASE_URL}/${encodeURIComponent(
    username,
  )}/${encodeURIComponent(sessionId)}?token=${encodeURIComponent(token)}`;
/*export const API_BASE_URL =
  "https://d02.srv.boundaryless.com:20002/Boundaryless_API";
//  "https://backend.mijnvirtueleassistent.nl/Boundaryless_API";
export const LOGIN_ENDPOINT = "/login";
export const GET_ME = "/me";
export const SESSIONS = "/sessions";
export const CREATE_SESSION = "/create_session";
export const DELETE_SESSION = "/delete_session";
export const CONVERSATION_HISTORY = "/conversation_history";
export const AGENT_ID = "87585267-ba27-4a3f-ba27-38347b39738a";
export const GET_CHAT_HISTORY = "/chats";
export const WS_BASE_URL =
  "wss://d02.srv.boundaryless.com:20002/Boundaryless_API/ws";
// "wss://backend.mijnvirtueleassistent.nl/Boundaryless_API/ws";
*/
