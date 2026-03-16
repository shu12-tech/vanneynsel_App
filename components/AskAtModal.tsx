import { themes } from "@/constants/Colors";
import { RootState } from "@/store";
import { setAsk } from "@/store/promptSlice";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BlurView } from "expo-blur";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TopdeskIcon from "./icons/TopdeskIcon";
import VilansIcon from "./icons/VilansIcon";
import ZenyaIcon from "./icons/ZenyaIcon";


interface AskAtModalProps {
  visible: boolean;
  onClose: () => void;
}

const AskAtModal: React.FC<AskAtModalProps> = ({ visible, onClose }) => {
  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];
  const dispatch = useDispatch();

  const styles = getStyles(theme);

  const sources = [
    {
      name: "vilans",
      description: "Informatie naar medische kennisbank",
      icon: <VilansIcon size={24} color="#ED0000" />,
      iconBg: "#FFCCCC",
    },
    {
      name: "zenya",
      description: "Informatie over de procedures van de organisatie",
      icon: <ZenyaIcon size={24} color="#0387FB" />,
      iconBg: "#CCE7FF",
    },
    {
      name: "topdesk",
      description: "Informatie over andere toepassingen",
      icon: <TopdeskIcon size={24} color="#00B200" />,
      iconBg: "#BFFFBF",
    },
  ];


  const handleSourcePress = (source: typeof sources[number]) => {
    dispatch(setAsk(source.name));
    onClose();
    
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint="dark" style={styles.modalOverlay} >
      <View >
        <View style={styles.modalOuterContainer}>
        <View style={styles.modalContainer}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Vragen @</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="window-close" size={24} color={themeName === 'dark' ? '#FFFFFF' : '#4D4D4D'} />
            </TouchableOpacity>
          </View>
          <View>
            {sources.map((source, index) => (
              <TouchableOpacity key={index} style={styles.sourceItem} onPress={() => handleSourcePress(source)}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: source.iconBg },
                  ]}
                >
                  {source.icon}
                </View>
                <View style={styles.sourceTextContainer}>
                  <Text style={styles.sourceName}>{source.name.charAt(0).toUpperCase() + source.name.slice(1)}</Text>
                  <Text style={styles.sourceDescription}>
                    {source.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        </View>
      </View>
        </BlurView>
    </Modal>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "#00000059",

    },
    modalContainer: {
      backgroundColor: theme.background,
      borderRadius: 24,
      paddingTop: 10,
      paddingBottom: 20,
      paddingHorizontal: 19,
      
      shadowColor: theme.containerShadow || '#BD317233',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    modalOuterContainer: {
      borderWidth: 1,
      borderColor:  '#FFFFFF33',
      borderRadius: 28,
      marginHorizontal: 7,
      marginBottom: 10,
      padding: 2,
      backgroundColor: 'transparent',
    },
    handle: {
      width: 40,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: "#ccc",
      alignSelf: "center",
      marginBottom: 10,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontFamily: 'Inter_500Medium',
      color: theme.text,
    },
    sourceItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    sourceTextContainer: {
      flex: 1,
    },
    sourceName: {
      fontSize: 16,
      fontFamily: 'Inter_500Medium',
      color: theme.text,
    },
    sourceDescription: {
      fontSize: 14,
      color: theme.textSecondary,
    },
  });

export default AskAtModal;
