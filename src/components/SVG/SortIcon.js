import React from 'react';
import Svg, {G, Line, Circle, Path} from 'react-native-svg';

const SortIcon = ({width = 25, height = 25}) => {
  return (
    <Svg width={width} height={height} viewBox="-1.2 -1.2 26.40 26.40">
      <Path
        d="M16 18L16 6M16 6L20 10.125M16 6L12 10.125"
        stroke="#3276c3"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 6L8 18M8 18L12 13.875M8 18L4 13.875"
        stroke="#3276c3"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SortIcon;
