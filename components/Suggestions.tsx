import { themes } from '@/constants/Colors';
import { RootState } from '@/store';
import { setPrompt } from '@/store/promptSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const suggestions = [
  {
    icon: <MaterialCommunityIcons name="cash-multiple" size={24} color="#4CAF50" />,
    text: 'Begrijp compensatie en toeslagen',
    input: 'Geef een toelichting op de vergoedingenstructuur, de in aanmerking komende vergoedingen en de regels voor het gebruik van het individuele ontwikkelingsbudget zoals beschreven in de arbeidsovereenkomsten en bijbehorende richtlijnen.',
  },
  {
    icon: <MaterialCommunityIcons name="calendar-clock" size={24} color="#2196F3" />,
    text: 'Verduidelijk werkuren en åverlofbeleid',
    input: 'Kunt u nadere informatie verstrekken over de toegestane werkuren, overuren, pauzes en verlofrechten zoals beschreven in de arbeidsovereenkomsten en bijbehorende documenten?',
  },
  {
    icon: <MaterialCommunityIcons name="shield-outline" size={24} color="#FF9800" />,
    text: 'Volg de gezondheids- en veiligheidsrichtlijnen',
    input: 'Kunt u mij de veiligheidsprocedures voor hittegolven, noodprotocollen en de aanbevolen voorzorgsmaatregelen in de documenten over veiligheid en gezondheid op de werkplek uitleggen?',
  },
  {
    icon: <MaterialCommunityIcons name="school-outline" size={24} color="#9C27B0" />,
    text: 'Ontdek ontwikkelingsactiviteiten',
    input: 'Welke trainingen, coaching of leeractiviteiten komen in aanmerking voor ondersteuning of vergoeding volgens het individueel ontwikkelingsbudget en de bijbehorende richtlijnen?',
  },
];

const Suggestions = () => {
  const dispatch = useDispatch();

    const themeName = useSelector((state: RootState) => state.theme.theme);
    const theme = themes[themeName];

    const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {suggestions.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.chip}
          onPress={() => dispatch(setPrompt(item.input))}
        >
          {item.icon}
          <Text style={styles.chipText} numberOfLines={1} ellipsizeMode="tail">{item.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
        padding: 10,
        
    margin: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 10,
    shadowColor: theme.borderColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  chipText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: theme.text,
  },
});

export default Suggestions;
