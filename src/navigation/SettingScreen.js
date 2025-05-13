import React, {Component} from 'react';
import {Setting, NewHeader} from '../containers';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export default class SettingScreen extends Component {
  static navigationOptions = ({navigation}) => ({
    header: <NewHeader navigation={navigation} back />,
  });
  render() {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <Setting {...this.props} navigation={this.props.navigation} />
      </GestureHandlerRootView>
    );
  }
}
