import React from 'react';
import Svg, {G, Line, Circle} from 'react-native-svg';

const FilterIcon = ({width = 25, height = 25}) => {
  return (
    <Svg width={width} height={height} viewBox="-3.2 -3.2 70.40 70.40">
      <G strokeWidth={3.456} stroke="#3276c3" fill="none">
        <Line x1={50.69} y1={32} x2={56.32} y2={32} />
        <Line x1={7.68} y1={32} x2={38.69} y2={32} />
        <Line x1={26.54} y1={15.97} x2={56.32} y2={15.97} />
        <Line x1={7.68} y1={15.97} x2={14.56} y2={15.97} />
        <Line x1={35} y1={48.03} x2={56.32} y2={48.03} />
        <Line x1={7.68} y1={48.03} x2={23} y2={48.03} />
        <Circle cx={20.55} cy={15.66} r={6} />
        <Circle cx={44.69} cy={32} r={6} />
        <Circle cx={29} cy={48.03} r={6} />
      </G>
    </Svg>
  );
};

export default FilterIcon;
