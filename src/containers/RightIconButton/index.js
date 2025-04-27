import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import * as Animatable from 'react-native-animatable';
import { Image } from 'react-native-animatable';


export default class RightIconButton extends Component {
  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.boxStyle}>
        <TouchableOpacity onPress={() => navigation.navigate('ListingsScreen', { item: this.props.item })}>
          <View style={styles.innerView} >

            <Image
              style={[this.props.item.id == "10547" ? { width: 70, height: 70, marginBottom: 5, marginTop: 30 } : { width: 50, height: 50, marginBottom: 15 },]} resizeMode="contain"
              source={this.props.image}
            />

            <Text style={styles.textStyle}>{this.props.MainText}</Text>
            <Text style={styles.textStyle2}>{this.props.SubText}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  innerView: {
    justifyContent: "center",
    width: (Dimensions.get('screen').width * 0.5),
    alignItems: "center",
    height: 170,
    borderColor: '#bbbbbb',
    borderWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderLeftWidth: 0
  },
  boxStyle: {
    justifyContent: "center",
    backgroundColor: '#fff',
    alignItems: "center",

  },
  textStyle: {
    fontSize: 18,
    fontFamily: 'Cairo-Regular',
    //  fontWeight: "600",
    color: '#636363',
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  textStyle2: {
    fontSize: 12,
    color: '#CA227B',
  },
});