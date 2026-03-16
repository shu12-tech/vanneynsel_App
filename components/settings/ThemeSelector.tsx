import MoonIcon from "@/components/icons/Moon";
import SunIcon from "@/components/icons/Sun";
import { useTheme } from "@/hooks/useTheme";
import { RootState } from "@/store";
import { setSystemTheme, setTheme, Theme } from "@/store/themeSlice";
import { AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";



type ThemeOption = {
  name: Theme | 'system';
  label: string;
  icon: string;
  iconSet: 'AntDesign' | 'Ionicons' | 'FontAwesome5' | 'MaterialIcons' | 'MaterialCommunityIcons' | 'Custom';
};

const themes: ThemeOption[] = [
  { name: "system", label: "System", icon: "phone-android", iconSet: "MaterialIcons" },
  { name: "van", label: "Van Neynsel", icon: "palette-outline", iconSet: "MaterialCommunityIcons" },
  { name: "light", label: "Licht", icon: "Sun", iconSet: "Custom" },
  { name: "dark", label: "Donker", icon: "Moon", iconSet: "Custom" },
];

export default function ThemeSelector() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const currentTheme = useSelector((state: RootState) => state.theme.theme);
  const systemTheme = useSelector((state: RootState) => state.theme.systemTheme);

  const systemColorScheme = useColorScheme(); 

  const handleThemeChange = (themeName: Theme | 'system') => {
    if (themeName === "system") {
      dispatch(setSystemTheme(true));
          dispatch(setTheme(systemColorScheme === 'dark' ? 'dark' : 'light'));

    } else {
      dispatch(setSystemTheme(false));
          dispatch(setTheme(themeName));

    }

    
  };

  const renderIcon = (icon: string, iconSet: 'AntDesign' | 'Ionicons' | 'FontAwesome5' | 'MaterialIcons' | 'MaterialCommunityIcons' | 'Custom', size: number, color: string) => {
    switch (iconSet) {
      case 'AntDesign':
        return <AntDesign name={icon as any} size={size} color={color} />;
      case 'Ionicons':
        return <Ionicons name={icon as any} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={icon as any} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={icon as any} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
      case 'Custom':
        if (icon === 'Sun') {
          return <SunIcon size={size} color={color} accessibilityLabel="Sun icon" />;
        }
        if (icon === 'Moon') {
          return <MoonIcon size={size} color={color} accessibilityLabel="Moon icon" />;
        }
      default:
        return null;
    }
  };

  return (
    <View>
      <Text style={[styles.heading, { color: currentTheme == 'dark' ? "#FFF" : "#4D4D4D" }]}>Verschijning</Text>
      <View style={styles.container}>
        {themes.map((item) => {
          const isSelected = item.name === 'system' ? systemTheme : (!systemTheme && currentTheme === item.name);
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.option,
                {
                  borderBottomWidth: isSelected ? 2 : 0,
                  borderBottomColor: isSelected ? "#FF4081" : 'transparent',
                  paddingBottom: isSelected ? 8 : 0,
                },
              ]}
              onPress={() => handleThemeChange(item.name)}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: theme.background,
                    borderColor: isSelected ? "#FF4081" : theme.borderColor,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                {renderIcon(item.icon, item.iconSet, 24,  theme.text)}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color:  theme.text,
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 20,
    marginLeft: 22,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  option: {
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height:  42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});
