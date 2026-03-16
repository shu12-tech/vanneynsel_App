import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
};

const StackedChevrons: React.FC<Props> = ({ width = 10, height = 24, color = 'black', style }) => {
  return (
    <View style={style}>
      <Svg width={width} height={height} viewBox="0 0 10 24" fill="none">
        <Path d="M4.59 7.83L7.76 11L9.17 9.59L4.59 5L0 9.59L1.42 11L4.59 7.83ZM4.59 2.83L7.76 6L9.17 4.59L4.59 0L0 4.59L1.42 6L4.59 2.83ZM4.59 21.17L1.42 18L0.0100002 19.41L4.59 24L9.18 19.41L7.76 18L4.59 21.17ZM4.59 16.17L1.42 13L0.0100002 14.41L4.59 19L9.18 14.41L7.76 13L4.59 16.17Z" fill={color} />
      </Svg>
    </View>
  );
};

export default StackedChevrons;
