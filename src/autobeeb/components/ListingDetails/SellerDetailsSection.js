import {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import KS from '../../../services/KSAPI';
import {Color, Constants, Languages} from '../../../common';
import {screenWidth} from '../../constants/Layout';
import DealerBanner from '../shared/DealerBanner';
import UserBanner from '../shared/UserBanner';
import DealerMapSection from './DealerMapSection';
import {AppIcon, Icons} from '../shared/AppIcon';
import {TouchableOpacity} from 'react-native';
import {Linking} from 'react-native';

const SellerDetailsSection = ({listingId, userId, name, typeId, phone}) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (userId)
      KS.GetUserCore({userId: userId, langId: Languages.langID}).then(res => {
        setUser(res.user);
      });
  }, [userId]);

  if (!user) return <View />;

  const handleWhatsapp = () => {
    const link = `https://autobeeb.com/${Languages.prefix}/ads/${name
      ?.trim()
      ?.replace(/\s+/g, '-')
      ?.replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, '')}/${listingId}/${typeId}`;

    const message =
      Languages.langID === 2
        ? `شاهدت إعلانك (${name?.trim()}) على اوتوبيب \n ${link} \n`
        : `${name?.trim()}\n${link} \n`;

    Linking.openURL(`https://wa.me/${phone}?text=${message}`).catch(() => {
      Alert.alert('خطأ', 'لا يمكن فتح واتساب');
    });
    KS.UpdateMobileClick({
      UserId: userId,
      ListingId: listingId,
    });
  };

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
      <View style={styles.cardContainer}>
        <TouchableOpacity
          onPress={handleWhatsapp}
          style={styles.whatsAppButton}>
          <Text style={styles.whatsAppText}>
            {Languages.whatsAppContactSeller}
          </Text>
          <AppIcon
            type={Icons.FontAwesome}
            name="whatsapp"
            size={30}
            color={'green'}
          />
        </TouchableOpacity>
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
  whatsAppButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'green',
    marginVertical: 8,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  whatsAppText: {
    color: 'green',
    fontSize: 15,
    fontFamily: Constants.fontFamilyBold,
  },
});
