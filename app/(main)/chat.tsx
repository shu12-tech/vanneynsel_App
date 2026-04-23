import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import Header from "@/components/Header";
import RatingFeedbackModal from "@/components/RatingFeedbackModal";
import { themes } from "@/constants/Colors";
import { getFeedbackUrl } from "@/constants/api";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { RootState } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { getMessages, setMessageFeedback } from "@/store/promptSlice";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const ChatScreen = () => {
  const dispatch = useAppDispatch();

  const chatMessages = useSelector((state: RootState) => state.prompt.messages);
  const { token } = useSelector((state: RootState) => state.auth);
  const { currentSession } = useSelector((state: RootState) => state.session);
  const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible();
  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];
  const flatListRef = useRef<FlatList>(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"up" | "down">("up");
  const [feedbackMessageId, setFeedbackMessageId] = useState("");

  // ✅ FIX: only fetch messages if NONE exist
  useEffect(() => {
    if (
      currentSession?.session_id &&
      (!chatMessages || chatMessages.length === 0)
    ) {
      dispatch(getMessages());
    }
  }, [currentSession?.session_id]);

  const submitFeedback = async (payload: {
    messageId: string;
    ratingType: "up" | "down";
    category?: string;
    additionalComments?: string;
  }) => {
    if (!token || !payload.messageId || !currentSession?.session_id) return;

    try {
      const response = await fetch(getFeedbackUrl(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: currentSession.session_id,
          chat_message_id: payload.messageId,
          feedback_status: payload.ratingType === "up" ? "good" : "bad",
          category: payload.category || null,
          additional_comments: payload.additionalComments || null,
        }),
      });

      const data = await response.json();
      console.log("feedback response:", data);

      if (data?.feedback) {
        dispatch(
          setMessageFeedback({
            messageId: payload.messageId,
            feedback: data.feedback,
          }),
        );
      }
    } catch (error) {
      console.log("Feedback submit error:", error);
    }
  };

  const handleRate = async (messageId: string, type: "up" | "down") => {
    if (!messageId) return;

    if (type === "up") {
      await submitFeedback({
        messageId,
        ratingType: "up",
      });
      return;
    }

    setFeedbackMessageId(messageId);
    setFeedbackType("down");
    setFeedbackOpen(true);
  };

  // ✅ SCROLL FIX (unchanged)
  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={styles.safeArea}>
        <Header />

        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={({ item, index }) =>
              item ? (
                <ChatMessage
                  message={item}
                  isUser={item.role === "user"}
                  isRated={!!item.feedback}
                  onExpand={() => {
                    if (index === chatMessages.length - 1) {
                      flatListRef.current?.scrollToEnd({ animated: true });
                    } else {
                      flatListRef.current?.scrollToIndex({
                        index,
                        animated: true,
                        viewPosition: 1,
                      });
                    }
                  }}
                  onRate={handleRate}
                />
              ) : null
            }
            keyExtractor={(item, index) => item?.id || index.toString()}
            contentContainerStyle={styles.listContainer}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            onScrollToIndexFailed={(info) => {
              flatListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }}
          />
        </View>

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: isKeyboardVisible ? keyboardHeight : 10 },
          ]}
        >
          <ChatInput />
        </View>

        <RatingFeedbackModal
          visible={feedbackOpen}
          ratingType={feedbackType}
          messageId={feedbackMessageId}
          onClose={() => setFeedbackOpen(false)}
          onSubmit={async (payload: {
            messageId: string;
            ratingType: "up" | "down";
            category: string;
            additionalComments: string;
          }) => {
            await submitFeedback({
              messageId: payload.messageId,
              ratingType: "down",
              category: payload.category,
              additionalComments: payload.additionalComments,
            });
            setFeedbackOpen(false);
          }}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  inputContainer: {
    justifyContent: "center",
  },
  listContainer: {
    padding: 10,
  },
});

export default ChatScreen;
