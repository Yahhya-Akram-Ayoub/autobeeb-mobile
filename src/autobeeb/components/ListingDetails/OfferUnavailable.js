import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {Color, Constants, Languages} from '../../../common';
import {screenWidth} from '../../constants/Layout';

const OfferUnavailable = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.Title}>{Languages.ThisOfferUnavalable}</Text>
      <TouchableOpacity
        style={{width: screenWidth}}
        onPress={() => navigation.goBack()}>
        <View style={styles.DetailsPayBox}>
          <Text style={styles.DetailsPayTitle}>{Languages.GoBack}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default OfferUnavailable;

const styles = StyleSheet.create({
  Title: {
    fontFamily: Constants.fontFamilyBold,
    fontSize: 20,
  },
  DetailsPayBox: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff0000',
    borderRadius: 10,
    width: '90%',
    marginVertical: 5,
    alignSelf: 'center',
  },
  DetailsPayTitle: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 18,
    fontFamily: Constants.fontFamilyBold,
  },
  cardContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: screenWidth,
    alignSelf: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 25,
  },
});
