import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import * as Animatable from 'react-native-animatable';
import IconFa from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import KS from '../../../services/KSAPI';
import {Color, Constants, Languages} from '../../../common';
import {screenWidth} from '../../constants/Layout';

const PostYourOfferBanner = () => {
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const ViewingCountry = useSelector(state => state.menu.ViewingCountry);

  const handlePress = () => {
    if (!user) {
      checkCountry();
    } else {
      navigation.navigate('PostOfferScreen');
    }
  };

  const checkCountry = () => {
    if (!user) {
      const cca2 = ViewingCountry?.cca2;
      KS.GetCountryCore({LangId: Languages.langID, Iso: cca2}).then(
        ({country}) => {
          if (country.emailRegister) {
            navigation.navigate('LoginScreen', {skippable: true});
          } else {
            navigation.navigate('PostOfferScreen');
          }
        },
      );
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <View style={styles.content}>
          <IconFa name="plus" size={20} color="#fff" style={styles.icon} />
          <Animatable.Text style={styles.text}>
            {Languages.PostYourOffer}
          </Animatable.Text>
          <Animatable.Text
            iterationCount="infinite"
            animation="flash"
            iterationDelay={5000}
            duration={2500}
            style={styles.flashText}>
            {Languages.FREE}
          </Animatable.Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    shadowColor: Color.secondary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    marginBottom: 8,
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
    width: screenWidth - 14,
    alignSelf: 'center',
    padding: 12,
    justifyContent: 'space-around',
    borderRadius: 10,
  },
  button: {
    width: screenWidth * 0.9,
    marginVertical: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    elevation: 1,
    borderRadius: 5,
    backgroundColor: Color.primary,
  },
  content: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 5,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    padding: 10,
    fontFamily: Constants.fontFamilySemiBold,
    fontSize: 20,
  },
  flashText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: Constants.fontFamilySemiBold,
  },
});

export default PostYourOfferBanner;
