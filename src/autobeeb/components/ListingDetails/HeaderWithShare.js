import {
  View,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Share,
  I18nManager,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import {AppLink} from '../shared/StaticData';
import {Languages} from '../../../common';
import {AppIcon, Icons} from '../shared/AppIcon';
import {screenWidth} from '../../constants/Layout';

const HeaderWithShare = ({name, listingId, typeId, backCkick}) => {
  const navigation = useNavigation();

  const getShareMessage = () => {
    const baseUrl =
      Languages.langID === 2
        ? 'https://autobeeb.com/ar/ads'
        : 'https://autobeeb.com/ads';

    const slugifiedName = encodeURIComponent(name.trim().replace(/\s+/g, '-'));

    return `${baseUrl}/${slugifiedName}/${listingId}/${typeId}`;
  };

  const onShare = async () => {
    try {
      const url = getShareMessage();

      const message = `${Languages.CheckOffer}\n${url}\n\n${Languages.DownloadAutobeeb}\n${AppLink}`;

      await Share.share({
        message,
        title: Languages.CheckOffer,
      });
    } catch (error) {
      console.warn('Share failed:', error);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerContainer}>
        <View style={styles.row}>
          <TouchableOpacity
            hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
            style={styles.closeButton}
            onPress={() => {
              if (backCkick) {
                backCkick();
              } else {
                navigation.goBack();
              }
            }}>
            <AppIcon
              type={Icons.Ionicons}
              name={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'}
              size={20}
              color={'white'}
            />
          </TouchableOpacity>

          <Pressable
            onPress={() => onShare('facebook')}
            style={styles.shareButton}>
            <FacebookIcon size={32} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 200,
    minHeight: 70,
    paddingTop: 15,
    width: screenWidth,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    marginRight: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 100,
    padding: 7,
  },
  shareButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});

const FacebookIcon = ({size = 24}) => {
  return (
    <View
      style={{
        backgroundColor: '#1877F2',
        borderRadius: 2,
        width: 26,
        height: 26,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M13.66 8.33H15V6.14c-.25-.03-1.11-.11-2.12-.11-2.1 0-3.53 1.28-3.53 3.63v2.02H7.5v2.53h1.85V20h2.53v-5.79h2.08l.33-2.53h-2.41V9.89c0-.73.2-1.22 1.28-1.22Z"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
};

export default HeaderWithShare;
