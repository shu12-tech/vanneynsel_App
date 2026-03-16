import { themes } from "@/constants/Colors";
import { RootState } from "@/store";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

type RatingType = "up" | "down";

type Props = {
  visible: boolean;
  ratingType: RatingType;
  messageId: string;
  onClose: () => void;
  onSubmit: (payload: {
    messageId: string;
    ratingType: RatingType;
    reason: string;
    additionalFeedback: string;
  }) => void;
};

const UP_REASONS = [
  "Feitelijk correct",
  "Makkelijk te begrijpen",
  "Informatief",
  "Creatief / interessant",
  "Anders, namelijk ....",
];

const DOWN_REASONS = [
  "Antwoord is onjuist",
  "Begrijpt mijn vraag niet",
  "Antwoord helpt mij niet verder",
  "Bron ontbreekt of klopt niet",
  "Anders, namelijk ....",
];

export default function RatingFeedbackModal({
  visible,
  ratingType,
  messageId,
  onClose,
  onSubmit,
}: Props) {
  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];
  const styles = getStyles(theme);

  const reasons = useMemo(
    () => (ratingType === "up" ? UP_REASONS : DOWN_REASONS),
    [ratingType],
  );

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (visible) {
      setSelectedReason("");
      setText("");
    }
  }, [visible]);

  const isOther = selectedReason === "Anders, namelijk ....";
  const textEnabled = !!selectedReason;
  const submitEnabled =
    !!selectedReason && (!isOther || text.trim().length > 0);

  const titleText = "Help ons jouw assistent te verbeteren";
  const subTitleText = "Toelichting (niet verplicht)";
  const placeholder = textEnabled
    ? "Toelichting"
    : "Kies wat er niet goed ging";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{titleText}</Text>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipsWrap}>
            {reasons.map((r) => {
              const selected = r === selectedReason;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => {
                    console.log("Reason clicked:", r);
                    console.log("Message ID:", messageId);
                    console.log("Rating Type:", ratingType);
                    setSelectedReason(r);
                  }}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.subTitle}>{subTitleText}</Text>

          <TextInput
            value={text}
            onChangeText={(value) => {
              console.log("Feedback text changed:", value);
              setText(value);
            }}
            editable={textEnabled}
            placeholder={placeholder}
            placeholderTextColor={themeName === "dark" ? "#9aa0a6" : "#6b7280"}
            style={[styles.input, !textEnabled && styles.inputDisabled]}
            multiline
          />

          <Text style={styles.note}>
            Deze feedback wordt gebruikt om toekomstige antwoorden te
            verbeteren.
          </Text>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                console.log("Feedback popup cancelled");
                console.log("Message ID:", messageId);
                console.log("Rating Type:", ratingType);
                onClose();
              }}
            >
              <Text style={styles.cancelText}>Annuleren</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                !submitEnabled && styles.submitDisabled,
              ]}
              disabled={!submitEnabled}
              onPress={() => {
                const payload = {
                  messageId,
                  ratingType,
                  reason: selectedReason,
                  additionalFeedback: text.trim(),
                };

                console.log("===== THUMBS DOWN SUBMITTED =====");
                console.log("Message ID:", payload.messageId);
                console.log("Rating Type:", payload.ratingType);
                console.log("Reason Selected:", payload.reason);
                console.log("Additional Feedback:", payload.additionalFeedback);
                console.log("Full Payload:", payload);
                console.log("=================================");

                onSubmit(payload);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.submitText,
                  !submitEnabled && styles.submitTextDisabled,
                ]}
              >
                Verzenden
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    card: {
      width: "100%",
      maxWidth: 520,
      backgroundColor: theme.background,
      borderRadius: 14,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.chatAssistant,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.chatAssistantText,
      flex: 1,
      paddingRight: 12,
    },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.chatAssistant,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.chatAssistant,
    },
    closeText: {
      fontSize: 22,
      lineHeight: 22,
      fontWeight: "700",
      color: theme.chatAssistantText,
    },

    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 14,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.chatAssistant,
      backgroundColor: theme.background,
    },
    chipSelected: {
      backgroundColor: theme.chatAssistant,
      borderColor: "#BD3172",
    },
    chipText: {
      fontSize: 14,
      color: theme.chatAssistantText,
      fontWeight: "500",
    },
    chipTextSelected: {
      fontWeight: "700",
      color: "#BD3172",
    },

    subTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.chatAssistantText,
      marginBottom: 8,
      opacity: 0.7,
    },

    input: {
      minHeight: 120,
      borderWidth: 1,
      borderColor: theme.chatAssistant,
      borderRadius: 10,
      padding: 12,
      textAlignVertical: "top",
      fontSize: 14,
      color: theme.chatAssistantText,
      backgroundColor: theme.chatAssistant,
    },
    inputDisabled: {
      backgroundColor: theme.chatAssistant,
      opacity: 0.7,
      color: theme.chatAssistantText,
    },

    note: {
      marginTop: 10,
      fontSize: 12,
      color: theme.chatAssistantText,
      lineHeight: 16,
      opacity: 0.7,
    },

    footer: {
      marginTop: 16,
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },
    cancelBtn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.chatAssistant,
      backgroundColor: theme.background,
    },
    cancelText: {
      fontWeight: "600",
      color: theme.chatAssistantText,
    },

    submitBtn: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 10,
      backgroundColor: "#BD3172",
    },
    submitDisabled: {
      backgroundColor: theme.chatAssistant,
      borderWidth: 1,
      borderColor: theme.chatAssistant,
    },
    submitText: {
      fontWeight: "700",
      color: "#fff",
    },
    submitTextDisabled: {
      color: theme.chatAssistantText,
      opacity: 0.6,
    },
  });
