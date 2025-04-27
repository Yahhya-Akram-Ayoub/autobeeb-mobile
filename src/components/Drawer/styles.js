import {StyleSheet, Dimensions} from 'react-native';
import {Color, Constants, Styles} from '../../common';

const {width, height, scale} = Dimensions.get('window'),
  vw = width / 100,
  vh = height / 100,
  vmin = Math.min(vw, vh),
  vmax = Math.max(vw, vh);

export default StyleSheet.create({
  container: {
    backgroundColor: '#F2F2F2',
    flexGrow: 1,
    paddingTop: 20,
  },
  avatar: {
    height: Styles.width / 3,
    width: Styles.width / 3,
    borderRadius: Styles.width / 8,
    //  marginBottom: 10
  },
  avatar_background: {
    padding: 10,
    backgroundColor: Color.SideMenu,
  },
  fullName: {
    fontWeight: '400',
    textAlign: 'center',
    color: Color.SideMenuText,
    backgroundColor: 'transparent',
    fontSize: Styles.FontSize.medium,
    marginBottom: 6,
    fontFamily: Constants.fontFamily,
  },
  email: {
    color: '#D24B92',
    backgroundColor: 'transparent',
    fontSize: 13,
  },
});
