import { themes } from "@/constants/Colors";
import { RootState } from "@/store";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { useSelector } from "react-redux";

const ChatMessage = ({
  message,
  isUser,
  onExpand,
  onRate,
}: {
  message: any;
  isUser: boolean;
  onExpand?: () => void;
  onRate?: (messageId: string, type: "up" | "down") => void;
}) => {
  const isAssistant = !isUser;
  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];

  const styles = getStyles(theme);
  const markdownStyles = getMarkdownStyles(theme);

  const isGenerating = message.text === "Reactie genereren...";

  const blocks = useMemo(() => {
    const text = message?.text;
    if (!text || typeof text !== "string") return [];

    // Helpers
    const isHeadingLine = (line: string) => /^\s{0,3}#{1,6}\s+/.test(line);
    // Top-level list items: allow at most 1 leading space; 2+ spaces are considered nested
    const isTopLevelListStart = (line: string) =>
      /^(?!\s{2,})\s*((?:\d+)\.|[-*+])\s+/.test(line);
    const isUnorderedListStart = (line: string) =>
      /^(?!\s{2,})\s*([-*+])\s+/.test(line);
    const isCodeFence = (line: string) => /^\s*```/.test(line);

    const lines = text.split("\n");
    const result: string[] = [];
    let i = 0;
    let inFence = false;

    while (i < lines.length) {
      let line = lines[i];

      // Skip leading blank lines between blocks
      if (!inFence && line.trim() === "") {
        i++;
        continue;
      }

      // Code fence block
      if (isCodeFence(line)) {
        inFence = true;
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
        inFence = false;
        result.push(buf.join("\n"));
        continue;
      }

      // Heading line as its own block (content that follows will be separate blocks)
      if (isHeadingLine(line)) {
        result.push(line);
        i++;
        continue;
      }

      // Top-level list item: capture the entire item with its nested content
      if (isTopLevelListStart(line)) {
        const isUnordered = isUnorderedListStart(line);
        const buf: string[] = [line];
        i++;
        while (i < lines.length) {
          const next = lines[i];

          if (isHeadingLine(next)) break;

          if (isTopLevelListStart(next)) {
            // For unordered lists, group items together.
            // For ordered lists, or if switching types, break to start a new block.
            if (!(isUnordered && isUnorderedListStart(next))) {
              break;
            }
          }

          // Keep blank lines and indented/nested content with this item
          buf.push(next);
          i++;
        }
        result.push(buf.join("\n"));
        continue;
      }

      // Paragraph block: capture contiguous lines until a separator or a new section start
      const buf: string[] = [line];
      i++;
      while (i < lines.length) {
        const next = lines[i];
        if (next.trim() === "") {
          // End paragraph at blank line but consume it
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
  }, [message?.text]);

  const isSectionStart = (block: string): boolean => {
    const firstLineRaw = block.split("\n")[0] ?? "";
    const trimmed = firstLineRaw.trim();
    // Markdown headings (allow up to 3 leading spaces)
    if (/^\s{0,3}#{1,6}\s+/.test(firstLineRaw)) return true;
    // Top-level list items (ordered or unordered): allow any indentation
    if (/^\s*((?:\d+)\.|[-*+])\s+/.test(firstLineRaw)) return true;
    // Paragraphs that are just bold/strong (treat as section headers sometimes used by clients)
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

    // Show some initial text before forcing "see more".
    let endIndex = 0;
    while (endIndex < blocks.length && !isSectionStart(blocks[endIndex])) {
      endIndex++;
    }
    if (endIndex < blocks.length) {
      // include the first section start (e.g., a list item or heading)
      endIndex++;
    }

    // Ensure a minimum amount of content initially for better UX
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
    // A "step" is each visibleBlocks value you can reach by clicking "Toon meer".
    // The initial view is step 1.
    if (blocks.length === 0) return [0];

    const steps: number[] = [
      Math.max(0, Math.min(initialVisibleBlocks, blocks.length)),
    ];

    const computeNext = (currentVisible: number) => {
      let i = currentVisible;
      if (i >= blocks.length) return blocks.length;

      // Mirrors handleSeeMore
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

    // Ensure the final step always corresponds to fully expanded content.
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

    // Fallback: count how many steps are <= current visibleBlocks
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
    let i = visibleBlocks; // next block to reveal
    if (i >= blocks.length) return;

    // If the next block is a heading, reveal that entire section (Heading + first content unit)
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

    // Otherwise, reveal until the next section start (list item or heading)
    i++;
    while (i < blocks.length && !isSectionStart(blocks[i])) i++;
    setVisibleBlocks(i);
    scheduleScrollToBottom();
  };

  const handleShowAll = () => {
    setVisibleBlocks(blocks.length);
    scheduleScrollToBottom();
  };

  // ✅ NEW: stable message id for feedback (prefer message.id if present)
  const messageId: string = useMemo(() => {
    if (message?.id != null) return String(message.id);
    // fallback: try timestamp fields; last resort: text hash-ish
    return String(
      message?.createdAt ?? message?.timestamp ?? message?.text ?? "",
    );
  }, [message?.id, message?.createdAt, message?.timestamp, message?.text]);

  const canShowRating = isAssistant && !isGenerating && !!message?.text;

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      {isAssistant ? (
        <>
          <Markdown style={markdownStyles}>{visibleMessage}</Markdown>

          {!isGenerating &&
            (hasMore ? (
              <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={handleSeeMore}>
                  <Text style={styles.showMoreText}>Toon meer</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleShowAll}>
                  <Text style={styles.showMoreText}>Toon alles</Text>
                </TouchableOpacity>

                <Text style={styles.sectionsCountText}>
                  Toont {shownStep} van {totalSteps} secties
                </Text>
              </View>
            ) : (
              <View style={styles.controlsContainer}>
                <Text style={styles.sectionsCountText}>
                  Toont {shownStep} van {totalSteps} secties
                </Text>
              </View>
            ))}

          {/* ✅ NEW: Thumbs Up / Down */}
          {canShowRating && (
            <View style={styles.ratingContainer}>
              <TouchableOpacity
                onPress={() => onRate?.(messageId, "up")}
                style={styles.thumbButton}
                accessibilityRole="button"
                accessibilityLabel="Thumbs up"
              >
                <Text style={styles.thumbIcon}>👍</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onRate?.(messageId, "down")}
                style={styles.thumbButton}
                accessibilityRole="button"
                accessibilityLabel="Thumbs down"
              >
                <Text style={styles.thumbIcon}>👎</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <Text style={styles.messageText}>{message.text}</Text>
      )}
    </View>
  );
};

// === STYLES ==========================================================================

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
    showMoreText: {
      color: "#BD3172",
      fontFamily: "Inter_700Bold",
    },
    sectionsCountText: {
      color: "#666666",
      fontSize: 14,
    },
    controlsContainer: {
      marginTop: 25,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },

    // ✅ NEW styles for rating buttons
    ratingContainer: {
      flexDirection: "row",
      gap: 16,
      marginTop: 14,
      alignItems: "center",
    },
    thumbButton: {
      paddingVertical: 6,
      paddingHorizontal: 6,
    },
    thumbIcon: {
      fontSize: 18,
    },
  });

const getMarkdownStyles = (theme: any) =>
  StyleSheet.create({
    body: {
      fontSize: 16,
      color: theme.chatAssistantText,
    },
    heading3: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      marginTop: 10,
      marginBottom: 5,
      color: theme.chatAssistantText,
    },
    paragraph: {
      marginBottom: 5,
      color: theme.chatAssistantText,
    },
    link: {
      color: "#BD3172",
    },
  });

export default ChatMessage;
