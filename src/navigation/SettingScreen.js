import React, {Component} from 'react';
import {Setting, NewHeader} from '../containers';

export default class SettingScreen extends Component {
  static navigationOptions = ({navigation}) => ({
    header: <NewHeader navigation={navigation} back />,
  });
  render() {
    return <Setting {...this.props} navigation={this.props.navigation} />;
  }
}
