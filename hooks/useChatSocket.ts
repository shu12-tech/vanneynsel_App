type SendChatMessageParams = {
  wsUrl: string;
  text: string;
  context: string | null;
  clientTurnId: string;
  onStatus: (status: string) => void;
  onDelta: (delta: string, clientTurnId: string) => void;
  onDone: (
    clientTurnId: string,
    assistantMessageId?: string | null,
    finalText?: string,
  ) => void;
  onError: () => void;
  onClose: () => void;
};

export const sendChatMessageWithSocket = ({
  wsUrl,
  text,
  context,
  clientTurnId,
  onStatus,
  onDelta,
  onDone,
  onError,
  onClose,
}: SendChatMessageParams) => {
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        text,
        context,
        file_ids: [],
        client_turn_id: clientTurnId,
      }),
    );
  };

  ws.onmessage = (e) => {
    try {
      const response = JSON.parse(e.data);
      const responseTurnId = response?.client_turn_id || clientTurnId;

      if (response?.type === "assistant_start") return;

      if (response?.type === "status") {
        onStatus(
          response?.message ||
            response?.text ||
            response?.status ||
            "Generating response...",
        );
        return;
      }

      if (response?.type === "phase") {
        onStatus(
          response?.message ||
            response?.text ||
            response?.phase ||
            "Working on your request...",
        );
        return;
      }

      if (response?.type === "assistant_delta") {
        if (response?.delta) {
          onDelta(response.delta, responseTurnId);
        }
        return;
      }

      if (response?.final || response?.type === "assistant_done") {
        onDone(
          responseTurnId,
          response?.assistant_message_id ?? null,
          response?.text ?? "",
        );
        ws.close();
        return;
      }

      if (
        typeof response?.text === "string" &&
        response.text &&
        !response.text.startsWith("\n---\n### Live results — Up next:")
      ) {
        onDelta(response.text, responseTurnId);
      }
    } catch (error) {
      console.error("WebSocket parse error:", error);
    }
  };

  ws.onerror = (e) => {
    console.error("WebSocket error:", e);
    onError();
  };

  ws.onclose = () => {
    console.log("WebSocket closed");
    onClose();
  };

  return ws;
};
