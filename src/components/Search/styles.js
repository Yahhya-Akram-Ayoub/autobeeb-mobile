import React, {
  Platform,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from 'react-native';
import {Color, Constants, Styles} from '../../common';

const {width, height, scale} = Dimensions.get('window'),
  vw = width / 100,
  vh = height / 100,
  vmin = Math.min(vw, vh),
  vmax = Math.max(vw, vh);

export default StyleSheet.create({
  flatlist: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 20,
  },
  pickerWrap: {
    // flexDirection: "row",
    //  alignItems: 'center',
    //justifyContent: "center",
    paddingHorizontal: 20,
  },
  text: {
    fontFamily: 'Cairo-Regular',
    color: Color.primary,
    textAlign: 'left',
    fontSize: 15,
    padding: 5,
  },
  picker: {
    fontSize: 16,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    backgroundColor: 'white',
    color: 'black',
  },
  more: {
    width: width,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    // backgroundColor: "#F5FCFF"
    //  padding: 10
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 30,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  Scientific: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: "#fff",
    marginBottom: 20,
    // justifyContent: "center"
  },
  scientificText: {
    fontFamily: Constants.fontFamily,
    fontSize: 15,
    textAlign: 'left',
    paddingLeft: 30,

    color: '#000',
  },
});
