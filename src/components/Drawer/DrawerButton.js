/**
 * Created by Kensoftware on 27/02/2017.
 */

import React, {Component} from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';

import {Styles, Color, Constants} from '../../common';
import {Icon} from '../../Omni';
import PropTypes from 'prop-types';

class DrawerButton extends Component {
  render() {
    const {text, onPress, icon} = this.props;
    return (
      <TouchableOpacity style={[styles.container]} onPress={onPress}>
        <Icon name={icon} color={Color.SideMenuText} size={20} />
        <Text style={[styles.text, Constants.RTL && {marginRight: 20}]}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  text: {
    marginHorizontal: 10,
    //  color: Color.lightTextPrimary,
    color: Color.SideMenuText,
    fontSize: Styles.FontSize.medium,
    textAlign: 'left',
    fontFamily: Constants.fontFamily,
  },
});

DrawerButton.propTypes = {
  text: PropTypes.string,
  onPress: PropTypes.func,
  icon: PropTypes.string,
};
DrawerButton.defaultProps = {
  text: 'Default button name',
  onPress: () => alert('Drawer button clicked'),
};

export default DrawerButton;
