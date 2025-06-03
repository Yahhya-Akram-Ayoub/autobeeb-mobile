import {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import KS from '../../../services/KSAPI';
import {Color, Constants, Languages} from '../../../common';
import {screenWidth} from '../../constants/Layout';
import DealerBanner from '../shared/DealerBanner';
import UserBanner from '../shared/UserBanner';
import DealerMapSection from './DealerMapSection';

const SellerDetailsSection = ({listingId, userId}) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (userId)
      KS.GetUserCore({userId: userId, langId: Languages.langID}).then(res => {
        setUser(res.user);
      });
  }, [userId]);

  if (!user) return <View />;

  return (
    <>
      <View style={styles.cardContainer}>
        <Text style={styles.blackHeader}>
          {user.isDealer ? Languages.DealerDetails : Languages.SelllerDetails}
        </Text>
        {user?.isDealer ? (
          <DealerBanner dealer={user} listingId={listingId} />
        ) : (
          <UserBanner user={user} listingId={listingId} />
        )}
      </View>

      {!!user?.latLng && <DealerMapSection latLng={user?.latLng} />}
    </>
  );
};

export default SellerDetailsSection;

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
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-around',
  },
  blackHeader: {
    paddingHorizontal: 10,
    width: '100%',
    paddingTop: 4,
    paddingBottom: 3,
    color: '#000',
    fontSize: 18,
    marginBottom: 5,
    fontFamily: Constants.fontFamilyBold,
  },
});
