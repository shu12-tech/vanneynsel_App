import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type IconProps = {
  size?: number;
  color?: string;
  accessibilityLabel?: string;
};

export default function Upload({ size = 18, color = '#666666', accessibilityLabel }: IconProps) {
  return (
    <View>
      <Svg
        width={size}
        height={size * 20 / 16}
        viewBox="0 0 16 20"
        fill="none"
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      >
        <Path
          d="M10 0H2C0.9 0 0.0100002 0.9 0.0100002 2L0 18C0 19.1 0.89 20 1.99 20H14C15.1 20 16 19.1 16 18V6L10 0ZM14 18H2V2H9V7H14V18ZM4 13.01L5.41 14.42L7 12.84V17H9V12.84L10.59 14.43L12 13.01L8.01 9L4 13.01Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}