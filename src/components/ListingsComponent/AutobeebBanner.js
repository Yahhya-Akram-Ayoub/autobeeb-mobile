import {useNavigation} from '@react-navigation/native';
import {ExtractScreenObjFromUrl} from '../../common';
import KS from '../../services/KSAPI';
import {Image, Linking} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {Dimensions} from 'react-native';

const AutobeebBanner = ({item}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      disabled={!item.BannerDetails.Link}
      style={{
        width: Dimensions.get('window').width,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={async () => {
        let url = item.BannerDetails.Link;
        if (!url) return;

        KS.BannerClick({
          bannerID: item.BannerDetails.ID,
        });

        const {screen, params} = await ExtractScreenObjFromUrl(url);
        if (!!screen) {
          navigation.navigate(screen, !!params && params);
        } else {
          Linking.openURL(url);
        }
      }}>
      <Image
        resizeMode="contain"
        source={{
          uri: `https://autobeeb.com/${item.BannerDetails.FullImagePath}.png`,
        }}
        style={{
          //  marginVertical: 10,
          alignSelf: 'center',
          width: Dimensions.get('window').width * 0.8,
          height: (Dimensions.get('window').width * 0.8) / 1.8,
          marginBottom: 8,
        }}
      />
    </TouchableOpacity>
  );
};

export default AutobeebBanner;
