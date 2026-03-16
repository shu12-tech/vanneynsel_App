import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import Header from "@/components/Header";
import RatingFeedbackModal from "@/components/RatingFeedbackModal";
import { themes } from "@/constants/Colors";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { RootState } from "@/store";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const ChatScreen = () => {
  const chatMessages = useSelector((state: any) => state.prompt.messages);
  const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible();
  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];
  const flatListRef = useRef<FlatList>(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"up" | "down">("up");
  const [feedbackMessageId, setFeedbackMessageId] = useState("");

  const handleRate = (messageId: string, type: "up" | "down") => {
    if (type === "up") {
      const payload = {
        messageId,
        ratingType: "up",
      };

      console.log("===== THUMBS UP SUBMITTED =====");
      console.log("Message ID:", payload.messageId);
      console.log("Rating Type:", payload.ratingType);
      console.log("Full Payload:", payload);
      console.log("================================");

      // later API call can go here
      return;
    }

    setFeedbackMessageId(messageId);
    setFeedbackType(type);
    setFeedbackOpen(true);
  };

  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);

  const renderContent = () => (
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
        onSubmit={(payload) => {
          console.log("===== THUMBS DOWN SUBMITTED =====");
          console.log("Message ID:", payload.messageId);
          console.log("Rating Type:", payload.ratingType);
          console.log("Reason Selected:", payload.reason);
          console.log("Additional Feedback:", payload.additionalFeedback);
          console.log("Full Payload:", payload);
          console.log("=================================");

          // later API call can go here
        }}
      />
    </SafeAreaView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
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

/*import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import Header from '@/components/Header';
import { themes } from '@/constants/Colors';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { RootState } from '@/store';
import React, { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';



const ChatScreen = () => {
  const chatMessages = useSelector((state: any) => state.prompt.messages);
  const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible();
  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);

  const renderContent = () => (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          renderItem={({ item, index }) => item ? (
            <ChatMessage 
              message={item} 
              isUser={item.role === 'user'} 
              onExpand={() => {
                if (index === chatMessages.length - 1) {
                  flatListRef.current?.scrollToEnd({ animated: true });
                } else {
                  flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 1 });
                }
              }} 
            />
          ) : null}
          keyExtractor={(item, index) => item?.id || index.toString()}
          contentContainerStyle={styles.listContainer}
          onScrollToIndexFailed={(info) => {
            flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }}
        />
      </View>
      <View style={[styles.inputContainer, { paddingBottom: isKeyboardVisible ? keyboardHeight : 10 }]}>
        <ChatInput />
      </View>
    </SafeAreaView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  inputContainer: {
    justifyContent: 'center',

  },
  listContainer: {
    padding: 10,
  },
});

export default ChatScreen;*/
