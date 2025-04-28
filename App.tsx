/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';


type SectionProps = PropsWithChildren<{
  title: string;
}>;
let picker = null;


function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedCountry, setSelectedCountry] = useState<string>('JO');
  const [pickerButtonColor, setButtonColor] = useState<string>('');
  const [pickerButtonTextStyle, setButtonTextStyle] = useState<StyleProp<TextStyle>>({});
  const [itemStyle, setItemStyle] = useState<StyleProp<ViewStyle>>({});
  const [cancelText, setCancelText] = useState<string>('');
  const [cancelTextStyle, setCancelTextStyle] = useState<StyleProp<TextStyle>>({});
  const [confirmText, setConfirmText] = useState<string>('');
  const [confirmTextStyle, setConfirmTextStyle] = useState<StyleProp<TextStyle>>({});
  const [pickerBackgroundColor, setPickerBackgroundColor] = useState<string>('');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  /*
   * To keep the template simple and small we're adding padding to prevent view
   * from rendering under the System UI.
   * For bigger apps the recommendation is to use `react-native-safe-area-context`:
   * https://github.com/AppAndFlow/react-native-safe-area-context
   *
   * You can read more about it here:
   * https://github.com/react-native-community/discussions-and-proposals/discussions/827
   */
  const safePadding = '5%';


  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={backgroundStyle}>
        <View style={{paddingRight: safePadding}}>
          <Header />
        </View>
        <IconMC
         name="home"
                  size={25}
                />
      </ScrollView>
    </View>
  );
}

export default App;
