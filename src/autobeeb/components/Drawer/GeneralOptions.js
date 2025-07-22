import {Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Color, Languages} from '../../../common';
import {AppIcon, Icons} from '../index';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

const GeneralOptions = () => {
  const navigation = useNavigation();
  const {user, userCountry} = useSelector(state => state.user);

  const AppLink = () => `https://cutt.ly/AUTOBEEB${Languages.getLanguage()}`;

  const ShareAccount = () => {
    Share.share({
      message: `${Languages.ShareAccountMessage}\nhttps://autobeeb.com/${
        user.IsDealer
          ? Languages.langID !== 1
            ? `${Languages.prefix}/dealer/profile/${user.ID}`
            : `dealer/profile/${user.ID}`
          : Languages.langID !== 1
          ? `${Languages.prefix}/user/profile/${user.ID}`
          : `user/profile/${user.ID}`
      }\n\n${Languages.DownloadAutobeeb}\n${AppLink()}`,
    });
  };

  const ShareFc = () => {
    Share.share({
      message: `${Languages.DownloadAutobeeb}\n\n${AppLink()}`,
    });
  };

  const options = [
    {
      label: Languages.MyChats,
      icon: 'chatbubbles',
      iconType: Icons.Ionicons,
      iconSize: 25,
      onPress: () => navigation.navigate('MessagesScreen'),
      isDisplay: !!user,
    },
    {
      isLine: true,
      isDisplay: true,
    },
    {
      label: Languages.Blog,
      icon: 'newsletter',
      iconType: Icons.Entypo,
      onPress: () =>
        navigation.navigate('HomeScreen', {
          screen: 'BlogsScreen',
          params: {isFromDrawer: true},
        }),
      isDisplay: true,
    },
    {
      label: Languages.Dealers,
      icon: 'users',
      iconType: Icons.FontAwesome,
      onPress: () => navigation.navigate('DealersScreen'),
      isDisplay: true,
    },
    {
      label: Languages.RecentlyViewed,
      icon: 'eye',
      iconType: Icons.MaterialCommunityIcons,
      onPress: () =>
        navigation.navigate('HomeScreen', {
          screen: 'RecentlyViewedScreen',
          params: {isFromDrawer: true},
        }),
      isDisplay: true,
    },
    {
      label: Languages.DetailsPayToAutobeeb,
      icon: 'credit-card',
      iconType: Icons.MaterialCommunityIcons,
      iconSize: 26,
      onPress: () =>
        navigation.navigate('PaymentDetailsAutobeeb', {
          user,
        }),
      isDisplay: !!user && !!userCountry && userCountry?.withFee,
    },
    {
      isLine: true,
      isDisplay: true,
    },
    {
      label: Languages.ShareApplication,
      icon: 'share',
      iconType: Icons.Entypo,
      onPress: ShareFc,
      isDisplay: true,
    },
    {
      label: Languages.ShareAccount,
      icon: 'account-box',
      iconType: Icons.MaterialCommunityIcons,
      onPress: ShareAccount,
      isDisplay: !!user,
    },
    {
      label: Languages.Settings,
      icon: 'settings',
      iconType: Icons.Ionicons,
      onPress: () => navigation.navigate('SettingScreen'),
      isDisplay: true,
    },
  ];

  return (
    <View>
      {options
        .filter(item => item.isDisplay)
        .map((option, index) => {
          if (option.isLine) return <View style={styles.rowsContainer} />;
          return (
            <TouchableOpacity
              key={index}
              style={styles.rowStyle}
              onPress={option.onPress}>
              <View
                style={{
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <AppIcon
                  type={option.iconType}
                  name={option.icon}
                  size={option.iconSize || 20}
                  color={Color.secondary}
                />
              </View>
              <Text style={{color: '#000', fontSize: 17}}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );
};

export default GeneralOptions;

const styles = StyleSheet.create({
  rowsContainer: {
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
  },
  rowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});
