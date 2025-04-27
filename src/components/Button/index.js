/**
 * Created by Kensoftware on 17/02/2017.
 */

import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {Color, Constants} from '../../common';
import {Icon} from '../../Omni';
import PropTypes from 'prop-types';

class Button extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      text,
      icon,
      onPress,
      button,
      containerStyle,
      textStyle,
      containerColor,
      textColor,
    } = this.props;
    return (
      <TouchableOpacity
        disabled={this.props.disabled}
        style={[
          styles.container,
          button,
          {backgroundColor: containerColor},
          containerStyle,
        ]}
        onPress={onPress}>
        {icon ? (
          <Icon name={icon} color={textColor} size={24} style={styles.icon} />
        ) : (
          <View />
        )}
        <Text
          style={[
            styles.text,
            {color: textColor, fontFamily: Constants.fontFamily},
            textStyle,
          ]}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    padding: 5,
    flexDirection: 'row',
  },
  text: {
    //  fontWeight: "bold"
    fontSize: 17,
  },
  icon: {
    marginRight: 10,
  },
});

Button.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.string,
  onPress: PropTypes.func,
  containerStyle: PropTypes.any,
  textStyle: PropTypes.any,
  containerColor: PropTypes.any,
  textColor: PropTypes.any,
};
Button.defaultProps = {
  text: 'Button',
  onPress: () => 'Button pressed!',
  containerStyle: {},
  textStyle: {},
  containerColor: Color.theme2,
  textColor: 'white',
};

export default Button;
