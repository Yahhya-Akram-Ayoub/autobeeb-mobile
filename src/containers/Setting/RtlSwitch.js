import React, {Component} from 'react';
import {View, Text, Switch, Alert, I18nManager} from 'react-native';

import {connect} from 'react-redux';
import RNRestart from 'react-native-restart';

import {Languages} from '../../common';

export default class RtlSwitch extends Component {
  state = {rtl: this.props.rtl};

  changeSwitch(value) {
    this.setState({rtl: value});
    const {switchRtl} = this.props;
    Alert.alert(Languages.Confirm, Languages.SwitchRtlConfirm, [
      {text: Languages.CANCEL, onPress: () => undefined},
      {
        text: Languages.OK,
        onPress: async () => {
          I18nManager.forceRTL(this.state.rtl);
          await switchRtl(this.state.rtl);
          RNRestart.Restart();
        },
      },
    ]);
  }

  render() {
    const {onTintColor} = this.props;
    return (
      <View style={{marginTop: 20}}>
        <View style={{alignItems: 'center'}}>
          <Text>{Languages.changeRTL}</Text>
        </View>
        <View style={{alignItems: 'center', marginTop: 20}}>
          <Switch
            onTintColor={onTintColor}
            onValueChange={this.changeSwitch.bind(this)}
            value={this.state.rtl}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({language}) => ({rtl: language.rtl});

function mergeProps(stateProps, dispatchProps, ownProps) {
  const {dispatch} = dispatchProps;
  const {actions} = require('../redux/LangRedux');
  return {
    ...ownProps,
    ...stateProps,
    switchRtl: rtl => actions.switchRtl(dispatch, rtl),
  };
}

module.exports = connect(mapStateToProps, undefined, mergeProps)(RtlSwitch);
