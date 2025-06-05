import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Color, Constants, Languages} from '../../../common';
import {useSelector} from 'react-redux';
import {AppIcon, Icons} from '../shared/AppIcon';
import {toast} from '../../../Omni';
import {AppLink} from '../shared/StaticData';
import {screenWidth} from '../../constants/Layout';

const ListingDetailsExtras = ({listingId, typeId, name}) => {
  const navigation = useNavigation();
  const {user, userCountry} = useSelector(state => state.user);

  const handlePaymentNavigation = () => {
    navigation.navigate('PaymentDetailsAutobeeb', {
      user: user,
    });
  };

  const getShareMessage = () => {
    const baseUrl =
      Languages.langID === 2 // arabic
        ? 'https://autobeeb.com/ar/ads/'
        : 'https://autobeeb.com/ads/';

    const nameSlug = name?.replace(/\s+/g, '-') ?? '';
    return `${baseUrl}${nameSlug}/${listingId}/${typeId}`;
  };

  const onShare = async listing => {
    try {
      const message = `${Languages.CheckOffer}\n${getShareMessage()}\n\n${
        Languages.DownloadAutobeeb
      }\n${AppLink}`;

      await Share.share({message});
    } catch (error) {
      toast(error.message);
    }
  };

  return (
    <>
      <View style={styles.cardContainer}>
        <Text style={styles.blackHeader}>{Languages.ShareOffer}</Text>

        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.socialRow}
          onPress={onShare}>
          <View style={styles.socialBox}>
            <AppIcon
              type={Icons.Entypo}
              name="facebook"
              size={28}
              color="#3b5998"
            />
          </View>
          <View style={styles.socialBox}>
            <AppIcon
              type={Icons.FontAwesome}
              name="whatsapp"
              size={28}
              color="#25d366"
            />
          </View>
          <View style={styles.socialBox}>
            <AppIcon
              type={Icons.FontAwesome}
              name="twitter-square"
              size={28}
              color="#1da1f2"
            />
          </View>
          <View style={styles.socialBox}>
            <AppIcon
              type={Icons.SimpleLineIcons}
              name="envelope-letter"
              size={28}
              color={Color.primary}
            />
          </View>
          <View style={styles.socialBox}>
            <AppIcon
              type={Icons.MaterialIcons}
              name="sms"
              size={28}
              color="#34b7f1"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Advice Section */}
      <View style={styles.cardContainer}>
        <Text style={styles.blackHeader}>{Languages.Advices}</Text>

        <View style={styles.adviceBox}>
          <Text style={styles.adviceText}>- {Languages.Advices1}</Text>
          <Text style={styles.adviceText}>- {Languages.Advices2}</Text>
          <Text style={styles.adviceText}>- {Languages.Advices3}</Text>
        </View>
      </View>
    </>
  );
};

export default ListingDetailsExtras;

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
  boxContainer: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  BoxShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bgWhite: {
    backgroundColor: '#fff',
  },
  marginBottom: {
    marginBottom: 10,
  },
  titleStyle: {
    textAlign: 'left',
  },
  titlePadding: {
    paddingHorizontal: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  titlePaddingSmall: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  socialRow: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  socialBox: {
    marginRight: 12,
  },
  DetailsPayBox: {
    margin: 10,
    padding: 14,
    backgroundColor: Color.primary,
    borderRadius: 6,
    alignItems: 'center',
  },
  DetailsPayTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  advicesContainer: {
    paddingBottom: 8,
  },
  adviceBox: {
    flexDirection: 'column',
    backgroundColor: '#eebc37',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 5,
    shadowColor: '#eebc37',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
    maxWidth: '94%',
  },
  adviceText: {
    fontSize: 16,
    fontFamily: Constants.fontFamilySemiBold,
    color: '#000',
  },
});
