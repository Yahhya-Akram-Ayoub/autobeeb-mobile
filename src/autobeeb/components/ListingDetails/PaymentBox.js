import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {Color, Constants, Languages} from '../../../common';
import {screenWidth} from '../../constants/Layout';

const PaymentBox = () => {
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user ?? state.user.tempUser);
  const userCountry = useSelector(state => state.user.userCountry);
  const shouldShowPayment = !!user && !!userCountry && !!userCountry.withFee;

  if (!shouldShowPayment) return <View />;

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('PaymentDetailsAutobeeb', {
            user,
          })
        }>
        <View style={styles.DetailsPayBox}>
          <Text style={styles.DetailsPayTitle}>
            {Languages.DetailsPayToAutobeeb}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentBox;

const styles = StyleSheet.create({
  DetailsPayBox: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff0000',
    borderRadius: 10,
    width: '95%',
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
    borderRadius: 10,
    justifyContent: 'space-around',
  },
});
