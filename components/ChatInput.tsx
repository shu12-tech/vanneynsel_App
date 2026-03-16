import { WS_BASE_URL } from '@/constants/api';
import { themes } from '@/constants/Colors';
import { addMessage, clearMessages, setAsk, setPrompt, updateLastMessage } from '@/store/promptSlice';
import { createSession } from '@/store/sessionSlice';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import AskAtModal from './AskAtModal';
import Camera from './icons/Camera';
import Database from './icons/Database';
import Upload from './icons/Upload';





const ChatInput = ({homeScreen = false}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const { prompt, ask } = useSelector((state: RootState) => state.prompt);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { currentSession } = useSelector((state: RootState) => state.session);
  const router = useRouter();

    const themeName = useSelector((state: RootState) => state.theme.theme);
    const theme = themes[themeName];

    const styles = getStyles(theme, homeScreen);
    // Set icon color: black when theme is dark, otherwise keep the default gray
    const iconColor = themeName === 'dark' ? '#000000' : '#4D4545';


  const handleInputChange = (text: string) => {
    dispatch(setPrompt(text));
  };

  const handleClearAsk = () => {
    dispatch(setAsk(null));
  };

  const handleSend = async () => {
    if (!prompt.trim() || !user || !token) return;
    Keyboard.dismiss();
    setIsSubmitting(true);


    // Local variable to hold the session for the current operation
    let sessionForThisSend = currentSession;

    if (homeScreen) {
      dispatch(clearMessages());
      // Create a new session and wait for it to be created
      const resultAction = await dispatch(createSession());

      if (createSession.fulfilled.match(resultAction)) {
        // If session creation is successful, use this new session
        sessionForThisSend = resultAction.payload;
        // Navigate to the chat screen
        router.push('/chat');
      } else {
        // Handle the case where session creation fails
        console.error("Failed to create session");
        dispatch(updateLastMessage('Error: Could not start a new chat session.'));
        setIsSubmitting(false);
        return;
      }
    }

    // Ensure there is a session to proceed
    if (!sessionForThisSend) {
      console.error("No active session for sending message.");
      dispatch(updateLastMessage('Error: No active chat session.'));
      setIsSubmitting(false);
      return;
    }

    // Add user's message and a placeholder for the assistant's response
    const userMessage: { role: 'user'; text: string } = { role: 'user', text: prompt };
    dispatch(addMessage(userMessage));
    dispatch(addMessage({ role: 'assistant', text: 'Reactie genereren...' }));
    let currentPrompt: string;
    if(ask){
          currentPrompt = `@ask ${ask}: ${prompt}`;
    } else {
          currentPrompt = prompt;
    }

    dispatch(setPrompt(''));

    // Establish WebSocket connection
    const ws = new WebSocket(`${WS_BASE_URL}/${user.username}/${sessionForThisSend.session_id}?token=${token}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ text: currentPrompt, context: ask }));
    };

    let responseReceived = false;
    ws.onmessage = (e) => {
      if (responseReceived) return; // Ignore further messages after final response

      const response = JSON.parse(e.data);
      if (response.text && !response.text.startsWith('\n---\n### Live results — Up next:')) {
        dispatch(updateLastMessage(response.text));
        responseReceived = true; // Mark that the final response has been received
        setIsSubmitting(false);
        ws.close(); // Close the connection as we have the final answer
      } else if (response.type === 'status') {
     //   dispatch(updateLastMessage(response.message));
      }
    };

    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
      dispatch(updateLastMessage('Error generating response.'));
      setIsSubmitting(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsSubmitting(false);
    };
  };

  return (
    <View>
    <BlurView
      intensity={ask ? 0 : 60}
      style={[
        ask ? styles.containerAsk : styles.container,
         // custom overrides
         {marginHorizontal: homeScreen ? 0 : 3}
      ]}
    >
      <View>
        {ask && (
          <View style={styles.askContainer}>
            <Text style={styles.askText}>@{ask}</Text>
            <TouchableOpacity onPress={handleClearAsk}>
              <MaterialCommunityIcons name="window-close" size={18} color={theme.askTextColor} 
              onPress={handleClearAsk}
              />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Typ hier"
            placeholderTextColor="#8e8e8e"
            multiline
         //   numberOfLines={7}
            value={prompt}
            onChangeText={handleInputChange}
          />
          <View style={styles.controlsContainer}>
            <View style={styles.leftControls}>
              {!ask && (
                <TouchableOpacity style={[styles.button, { backgroundColor: theme.iconPrimaryBg }]} onPress={() => setModalVisible(true)}>
                  <Database size={24} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.button}>
                <Upload size={16} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Camera size={22} color={iconColor} />
              </TouchableOpacity>
            </View>
            <View style={styles.rightControls}>
              <TouchableOpacity style={styles.micButton}>
                <MaterialIcons name="mic" size={24} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sendButton, { opacity: (!prompt.trim() || isSubmitting) ? 0.7 : 1 }]} onPress={(!prompt.trim() || isSubmitting) ? undefined : handleSend}>
                <Ionicons name="arrow-up" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <AskAtModal visible={modalVisible} onClose={() => setModalVisible(false)} />
       
      </View>
      
    </BlurView>

       <Text style={styles.disclaimerText}>
            De reacties van de assistent zijn AI gegenereerd
          </Text>

          </View>
  );
};

const getStyles = (theme: any, homeScreen: boolean) => {
  const { height } = Dimensions.get('window');
  const isSmallScreen = height < 700;

  return StyleSheet.create({
  container: {
    borderRadius: 25,
    margin: 1,
    shadowColor: '#BD3172',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    padding: 3,
  },
  containerAsk: {
    backgroundColor: theme.iconPrimaryBg,
    borderRadius: 26,
    paddingTop: 4,
    paddingBottom: 3.5,
    paddingHorizontal: 3.5,
    margin: 1,
    shadowColor: theme.borderColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  askContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  askText: {
    color: theme.askTextColor,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  inputContainer: {
    backgroundColor: theme.inputBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingTop: 10,
    minHeight: 50,
  },
  input: {
    fontSize: 16,
    color: theme.text,
    maxHeight: 160, // Allow scrolling after this height
    minHeight: homeScreen ? (isSmallScreen ? 80 : 112) : 50,
    textAlignVertical: 'top',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  leftControls: {
    flexDirection: 'row',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEDEDE99',
  borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginRight: 10,
  },
  buttonText: {
    marginLeft: 5,
    color: '#4D4545',
    fontFamily: 'Inter_500Medium',
  },
  micButton: {
    backgroundColor: '#DEDEDE99',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor:theme.iconPrimaryBg,
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimerText: {
    paddingVertical: 6,
   // marginVertical: 1,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 12,
    letterSpacing: -0.24,
    color: '#666666',
    textAlign: 'center',
  },
  });
};

export default ChatInput;
