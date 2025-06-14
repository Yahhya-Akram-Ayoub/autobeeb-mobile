import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
} from 'react-native';
import SpecialSVG from './SpecialSVG';
import {Color, Constants, Languages} from '../../../common';
import {AppIcon, Icons} from '../shared/AppIcon';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {SkeletonLoader} from '../shared/Skeleton';

const FeatureListingBtn = ({
  loading,
  listingId,
  isSpecial,
  secialExpiryDate,
  ownerId,
  openOTPModale,
}) => {
  const user = useSelector(state => state.user.user ?? state.user.tempUser);
  const navigation = useNavigation();
  const {EmailRegister, OTPConfirmed, EmailConfirmed, ID, Email, Phone} =
    user ?? {};
  const isOwner = ownerId === ID;
  const notOtpConfirmed =
    OTPConfirmed === false && !EmailRegister && ownerId === ID;
  const notEmailConfirmed =
    EmailConfirmed === false && EmailRegister && ownerId === ID;

  const handlePress = () => {
    if (isOwner) {
      if (notOtpConfirmed || notEmailConfirmed) {
        openOTPModale && openOTPModale();
      } else {
        navigation.navigate('SpecialPlans', {listingId});
      }
    } else if (!ID) {
      navigation.navigate('PostOfferScreen');
    } else {
      navigation.navigate('ActiveOffers');
    }
  };

  if (loading)
    return (
      <View style={[styles.sellFastContainer, {padding: 0}]}>
        <SkeletonLoader
          containerStyle={[{height: 85}]}
          borderRadius={3}
          shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
          animationDuration={1200}
        />
      </View>
    );

  if (isSpecial && !!ID && isOwner) {
    return (
      <View style={[styles.sellFastContainer, {backgroundColor: 'red'}]}>
        <View style={styles.sellFastBox}>
          <Text style={styles.sellFastTitle}>
            {Languages.FeaturedUntil}
            {new Date(secialExpiryDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.sellFastContainer}>
        <View style={styles.sellFastBox}>
          <Text style={styles.sellFastTitle}>
            {Languages.SpecialYourOfferAction}
          </Text>
          <SpecialSVG color="#e5e82c" />
        </View>
        <View style={styles.sellFastButton}>
          <AppIcon
            type={Icons.Entypo}
            name="rocket"
            size={20}
            color={Color.primary}
          />
          <Text style={styles.sellFastButtonText}>
            {Languages.SpecialYourOfferTitle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FeatureListingBtn;

const styles = StyleSheet.create({
  sellFastTitle: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 17,
    fontFamily: Constants.fontFamilyBold,
  },
  sellFastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 5,
    textAlign: 'center',
    textAlignVertical: 'center',
    justifyContent: 'center',
    height: 35,
    width: '92%',
    alignSelf: 'center',
  },
  sellFastButtonText: {
    color: Color.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    fontFamily: Constants.fontFamilyBold,
    marginHorizontal: 2,
  },
  sellFastContainer: {
    minHeight: 45,
    backgroundColor: Color.primary,
    padding: 10,
    gap: 5,
  },
  sellFastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
