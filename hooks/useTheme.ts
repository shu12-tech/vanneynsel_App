import { useSelector } from 'react-redux';
import { themes } from '../constants/Colors';
import { RootState } from '../store';

export const useTheme = () => {
  const themeName = useSelector((state: RootState) => state.theme.theme);
  return themes[themeName];
};
