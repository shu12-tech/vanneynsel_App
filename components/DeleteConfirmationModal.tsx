import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { themes } from "../constants/Colors";
import { RootState } from "../store";


interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {

      const themeName = useSelector((state: RootState) => state.theme.theme);
    const theme = themes[themeName];

    const styles = getStyles(theme);
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Verwijderen?</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalText}>
            Weet u zeker dat u dit wilt verwijderen?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonDelete]}
              onPress={onConfirm}
            >
              <Text style={styles.textStyleDelete}>Ja, verwijderen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.textStyleCancel}>Nee, niet verwijderen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: theme.background,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: theme.text,
  },
  modalText: {
    marginVertical: 15,
    textAlign: "left",
    alignSelf: "flex-start",
    fontSize: 16,
    color: theme.text 
  },
  modalButtons: {
    flexDirection: "column",
    width: "100%",
    marginTop: 20,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonDelete: {
    backgroundColor: theme.background,
    borderColor: theme.notification,
    borderWidth: 2,
  },
  buttonCancel: {
    backgroundColor: theme.background,
    borderColor: theme.text,
    borderWidth: 2,
  },
  textStyleDelete: {
    color: theme.notification,
    fontFamily: 'Inter_600SemiBold',
    textAlign: "center",
    fontSize: 16,
  },
  textStyleCancel: {
    color: theme.text,
    fontFamily: 'Inter_600SemiBold',
    textAlign: "center",
    fontSize: 16,
  },
});

export default DeleteConfirmationModal;
