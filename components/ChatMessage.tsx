import { themes } from "@/constants/Colors";
import { RootState } from "@/store";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { useSelector } from "react-redux";

const ChatMessage = ({
  message,
  isUser,
  isRated,
  onExpand,
  onRate,
}: {
  message: any;
  isUser: boolean;
  isRated?: boolean;
  onExpand?: () => void;
  onRate?: (messageId: string, type: "up" | "down") => void;
}) => {
  const isAssistant = !isUser;
  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];

  const styles = getStyles(theme);
  const markdownStyles = getMarkdownStyles(theme);

  const [showFeedbackSubmitted, setShowFeedbackSubmitted] = useState(false);
  const [hideFeedbackCompletely, setHideFeedbackCompletely] = useState(false);

  // ✅ STATUS SHOULD NOT COME INSIDE BUBBLE
  // Only assistant_delta text should show here
  const displayText = message?.text || "";

  const isGenerating = false;

  useEffect(() => {
    if (message?.feedback || isRated) {
      setShowFeedbackSubmitted(true);
      setHideFeedbackCompletely(false);

      const timer = setTimeout(() => {
        setShowFeedbackSubmitted(false);
        setHideFeedbackCompletely(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message?.feedback, isRated]);

  const blocks = useMemo(() => {
    const text = displayText;
    if (!text || typeof text !== "string") return [];

    const isHeadingLine = (line: string) => /^\s{0,3}#{1,6}\s+/.test(line);
    const isTopLevelListStart = (line: string) =>
      /^(?!\s{2,})\s*((?:\d+)\.|[-*+])\s+/.test(line);
    const isUnorderedListStart = (line: string) =>
      /^(?!\s{2,})\s*([-*+])\s+/.test(line);
    const isCodeFence = (line: string) => /^\s*```/.test(line);

    const lines = text.split("\n");
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.trim() === "") {
        i++;
        continue;
      }

      if (isCodeFence(line)) {
        const buf: string[] = [line];
        i++;
        while (i < lines.length) {
          buf.push(lines[i]);
          if (isCodeFence(lines[i])) {
            i++;
            break;
          }
          i++;
        }
        result.push(buf.join("\n"));
        continue;
      }

      if (isHeadingLine(line)) {
        result.push(line);
        i++;
        continue;
      }

      if (isTopLevelListStart(line)) {
        const isUnordered = isUnorderedListStart(line);
        const buf: string[] = [line];
        i++;
        while (i < lines.length) {
          const next = lines[i];

          if (isHeadingLine(next)) break;

          if (isTopLevelListStart(next)) {
            if (!(isUnordered && isUnorderedListStart(next))) {
              break;
            }
          }

          buf.push(next);
          i++;
        }
        result.push(buf.join("\n"));
        continue;
      }

      const buf: string[] = [line];
      i++;
      while (i < lines.length) {
        const next = lines[i];
        if (next.trim() === "") {
          i++;
          break;
        }
        if (
          isHeadingLine(next) ||
          isTopLevelListStart(next) ||
          isCodeFence(next)
        ) {
          break;
        }
        buf.push(next);
        i++;
      }
      result.push(buf.join("\n"));
    }

    return result;
  }, [displayText]);

  const isSectionStart = (block: string): boolean => {
    const firstLineRaw = block.split("\n")[0] ?? "";
    const trimmed = firstLineRaw.trim();
    if (/^\s{0,3}#{1,6}\s+/.test(firstLineRaw)) return true;
    if (/^\s*((?:\d+)\.|[-*+])\s+/.test(firstLineRaw)) return true;
    if (/^(?:\*\*.*\*\*|__.*__)$/.test(trimmed)) return true;
    return false;
  };

  const isHeadingBlock = (block: string): boolean => {
    const firstLineRaw = block.split("\n")[0] ?? "";
    return /^\s{0,3}#{1,6}\s+/.test(firstLineRaw);
  };

  const isListBlock = (block: string): boolean => {
    const firstLineRaw = block.split("\n")[0] ?? "";
    return /^\s*((?:\d+)\.|[-*+])\s+/.test(firstLineRaw);
  };

  const initialVisibleBlocks = useMemo(() => {
    if (blocks.length === 0) return 0;

    let endIndex = 0;
    while (endIndex < blocks.length && !isSectionStart(blocks[endIndex])) {
      endIndex++;
    }
    if (endIndex < blocks.length) {
      endIndex++;
    }

    const MIN_CHARS = 150;
    let combinedLen = blocks
      .slice(0, Math.max(1, endIndex))
      .join("\n\n").length;

    let hasList = blocks.slice(0, endIndex).some(isListBlock);

    while (endIndex < blocks.length && combinedLen < MIN_CHARS) {
      if (hasList) break;

      const next = blocks[endIndex];

      if (isListBlock(next)) {
        combinedLen += (next?.length ?? 0) + 2;
        endIndex++;
        hasList = true;
        break;
      }

      combinedLen += (next?.length ?? 0) + 2;
      endIndex++;
    }

    return Math.max(1, Math.min(endIndex, blocks.length));
  }, [blocks]);

  const [visibleBlocks, setVisibleBlocks] = useState(initialVisibleBlocks);

  useEffect(() => {
    setVisibleBlocks(initialVisibleBlocks);
  }, [initialVisibleBlocks]);

  const seeMoreSteps = useMemo(() => {
    if (blocks.length === 0) return [0];

    const steps: number[] = [
      Math.max(0, Math.min(initialVisibleBlocks, blocks.length)),
    ];

    const computeNext = (currentVisible: number) => {
      let i = currentVisible;
      if (i >= blocks.length) return blocks.length;

      if (isHeadingBlock(blocks[i])) {
        i++;
        if (i < blocks.length) {
          if (isSectionStart(blocks[i])) {
            i++;
          } else {
            while (i < blocks.length && !isSectionStart(blocks[i])) {
              i++;
            }
          }
        }
        return Math.min(i, blocks.length);
      }

      i++;
      while (i < blocks.length && !isSectionStart(blocks[i])) {
        i++;
      }
      return Math.min(i, blocks.length);
    };

    while (steps[steps.length - 1] < blocks.length) {
      const next = computeNext(steps[steps.length - 1]);
      if (next <= steps[steps.length - 1]) break;
      steps.push(next);
    }

    if (steps[steps.length - 1] !== blocks.length) {
      steps.push(blocks.length);
    }

    return steps;
  }, [blocks, initialVisibleBlocks]);

  const totalSteps = seeMoreSteps.length;

  const shownStep = useMemo(() => {
    if (blocks.length === 0) return 1;
    if (visibleBlocks >= blocks.length) return totalSteps;

    const exactIndex = seeMoreSteps.findIndex((v) => v === visibleBlocks);
    if (exactIndex >= 0) return exactIndex + 1;

    let count = 0;
    for (const v of seeMoreSteps) {
      if (v <= visibleBlocks) count++;
    }
    return Math.max(1, Math.min(count, totalSteps));
  }, [blocks.length, seeMoreSteps, totalSteps, visibleBlocks]);

  const visibleMessage = useMemo(() => {
    return blocks.slice(0, visibleBlocks).join("\n\n");
  }, [blocks, visibleBlocks]);

  const hasMore = visibleBlocks < blocks.length;

  const scheduleScrollToBottom = () => {
    if (!onExpand) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        onExpand();
        setTimeout(onExpand, 150);
      });
    });
  };

  const handleSeeMore = () => {
    if (!hasMore) return;
    let i = visibleBlocks;
    if (i >= blocks.length) return;

    if (isHeadingBlock(blocks[i])) {
      i++;
      if (i < blocks.length) {
        if (isSectionStart(blocks[i])) {
          i++;
        } else {
          while (i < blocks.length && !isSectionStart(blocks[i])) i++;
        }
      }
      setVisibleBlocks(i);
      scheduleScrollToBottom();
      return;
    }

    i++;
    while (i < blocks.length && !isSectionStart(blocks[i])) i++;
    setVisibleBlocks(i);
    scheduleScrollToBottom();
  };

  const handleShowAll = () => {
    setVisibleBlocks(blocks.length);
    scheduleScrollToBottom();
  };

  const messageId: string = useMemo(() => {
    if (message?.id != null) return String(message.id);
    return String(
      message?.createdAt ?? message?.timestamp ?? message?.text ?? "",
    );
  }, [message?.id, message?.createdAt, message?.timestamp, message?.text]);

  const canShowRating = isAssistant && !isGenerating && !!message?.text?.trim();

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      {isAssistant ? (
        <>
          <Markdown style={markdownStyles}>{visibleMessage || ""}</Markdown>

          {hasMore ? (
            <View style={styles.controlsContainer}>
              <TouchableOpacity onPress={handleSeeMore}>
                <Text style={styles.showMoreText}>Show more</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleShowAll}>
                <Text style={styles.showMoreText}>Show all</Text>
              </TouchableOpacity>

              <Text style={styles.sectionsCountText}>
                Showing {shownStep} of {totalSteps} sections
              </Text>
            </View>
          ) : (
            <View style={styles.controlsContainer}>
              <Text style={styles.sectionsCountText}>
                Showing {shownStep} of {totalSteps} sections
              </Text>
            </View>
          )}

          {canShowRating && !hideFeedbackCompletely && (
            <View style={styles.feedbackRow}>
              {!showFeedbackSubmitted ? (
                <>
                  <Text style={styles.feedbackText}>Submit your feedback</Text>

                  <View style={styles.thumbGroup}>
                    <TouchableOpacity
                      onPress={() => onRate?.(messageId, "up")}
                      style={styles.thumbButton}
                      accessibilityRole="button"
                      accessibilityLabel="Thumbs up"
                    >
                      <MaterialCommunityIcons
                        name="thumb-up-outline"
                        size={16}
                        color="#6B7280"
                      />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                      onPress={() => onRate?.(messageId, "down")}
                      style={styles.thumbButton}
                      accessibilityRole="button"
                      accessibilityLabel="Thumbs down"
                    >
                      <MaterialCommunityIcons
                        name="thumb-down-outline"
                        size={16}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text style={styles.feedbackSubmitted}>Feedback submitted</Text>
              )}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.messageText}>{message.text}</Text>
      )}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    messageContainer: {
      borderRadius: 20,
      padding: 15,
      marginVertical: 5,
      maxWidth: "90%",
      marginHorizontal: 1,
    },
    userMessage: {
      backgroundColor: theme.chatUser,
      alignSelf: "flex-end",
    },
    botMessage: {
      backgroundColor: theme.chatAssistant,
      alignSelf: "flex-start",
      width: "90%",
    },
    messageText: {
      fontSize: 16,
      color: theme.chatUserText,
    },
    statusText: {
      fontSize: 15,
      color: "#6B7280",
      fontStyle: "italic",
      lineHeight: 22,
    },
    showMoreText: {
      color: "#6B7280",
      fontFamily: "Inter_700Bold",
    },
    sectionsCountText: {
      color: "#6B7280",
      fontSize: 13,
    },
    controlsContainer: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },
    feedbackRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: 12,
      width: "100%",
    },
    feedbackText: {
      fontSize: 12,
      color: "#6B7280",
      marginRight: 8,
    },
    feedbackSubmitted: {
      fontSize: 12,
      color: "#e9218f",
      fontWeight: "600",
    },
    thumbGroup: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F3F4F6",
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 4,
    },
    thumbButton: {
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    divider: {
      width: 1,
      height: 14,
      backgroundColor: "#D1D5DB",
    },
  });

const getMarkdownStyles = (theme: any) => ({
  body: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 10,
    color: theme.text,
  },
  heading1: {
    color: theme.text,
    fontSize: 24,
    marginBottom: 10,
  },
  heading2: {
    color: theme.text,
    fontSize: 21,
    marginBottom: 8,
  },
  heading3: {
    color: theme.text,
    fontSize: 18,
    marginBottom: 8,
  },
  bullet_list: {
    marginBottom: 10,
  },
  ordered_list: {
    marginBottom: 10,
  },
  list_item: {
    color: theme.text,
    marginBottom: 6,
  },
  code_inline: {
    backgroundColor: "#F3F4F6",
    color: "#111827",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: "#F3F4F6",
    color: "#111827",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  fence: {
    backgroundColor: "#F3F4F6",
    color: "#111827",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#D1D5DB",
    paddingLeft: 12,
    color: "#4B5563",
    marginVertical: 8,
  },
});

export default ChatMessage;
