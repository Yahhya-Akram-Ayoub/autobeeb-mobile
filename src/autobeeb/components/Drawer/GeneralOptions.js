import {
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Color, Languages} from '../../../common';
import {AppIcon, Icons} from '../index';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';

const GeneralOptions = () => {
  const navigation = useNavigation();
  const {user, userCountry} = useSelector(state => state.user);
  console.log({user, userCountry});
  
  const AppLink = () => `https://cutt.ly/AUTOBEEB${Languages.getLanguage()}`;
  const ShareAccount = () => {
    Share.share({
      message: `${Languages.ShareAccountMessage}\nhttps://autobeeb.com/${
        user.isDealer
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

  return (
    <View>
      <View style={styles.rowsContainer}>
        <TouchableOpacity
          style={styles.rowStyle}
          onPress={() => {
            this.props.navigation.navigate('HomeScreen', {
              screen: 'BlogsScreen',
            });
          }}>
          <View
            style={{
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <AppIcon
              type={Icons.Entypo}
              name="newsletter"
              size={20}
              color={Color.secondary}
              //    style={{ marginRight: 15 }}
            />
          </View>

          <Text style={{color: '#000', fontSize: 17}}>{Languages.Blog}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rowStyle}
          onPress={() => {
            this.props.navigation.navigate('DealersScreen');
          }}>
          <View
            style={{
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <AppIcon
              type={Icons.FontAwesome}
              name="users"
              size={20}
              color={Color.secondary}
              //  style={{ marginRight: 15 }}
            />
          </View>

          <Text style={{color: '#000', fontSize: 17}}>{Languages.Dealers}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rowStyle}
          onPress={() => {
            this.props.navigation.navigate('HomeScreen', {
              screen: 'RecentlyViewedScreen',
            });
          }}>
          <View
            style={{
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <AppIcon
              type={Icons.MaterialCommunityIcons}
              name="eye"
              size={20}
              color={Color.secondary}
              //    style={{ marginRight: 15 }}
            />
          </View>

          <Text style={{color: '#000', fontSize: 17}}>
            {Languages.RecentlyViewed}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowsContainer}>
        {!!user && !!userCountry && userCountry?.WithFee && (
          <TouchableOpacity
            //hide
            style={styles.rowStyle}
            onPress={() => {
              navigation.navigate('PaymentDetailsAutobeeb', {
                userCountry: userCountry,
                user: user,
              });
            }}>
            <View
              style={{
                width: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppIcon
                type={Icons.MaterialCommunityIcons}
                name="credit-card"
                size={26}
                color={Color.secondary}
                style={{marginRight: 10}}
              />
            </View>

            <Text style={{color: '#000', fontSize: 17}}>
              {Languages.DetailsPayToAutobeeb}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.rowStyle} onPress={ShareFc}>
          <View
            style={{
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <AppIcon
              type={Icons.Entypo}
              name="share"
              size={20}
              color={Color.secondary}
            />
          </View>

          <Text style={{color: '#000', fontSize: 17}}>
            {Languages.ShareApplication}
          </Text>
        </TouchableOpacity>

        {user && (
          <TouchableOpacity style={styles.rowStyle} onPress={ShareAccount}>
            <View
              style={{
                width: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppIcon
                type={Icons.MaterialCommunityIcons}
                name="account-box"
                size={20}
                color={Color.secondary}
                //  style={{ marginRight: 15 }}
              />
            </View>

            <Text style={{color: '#000', fontSize: 17}}>
              {Languages.ShareAccount}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.rowStyle}
          onPress={() => {
            navigation.navigate('SettingScreen');
          }}>
          <View
            style={{
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <AppIcon
              type={Icons.Ionicons}
              name="settings"
              size={20}
              color={Color.secondary}
            />
          </View>

          <Text style={{color: '#000', fontSize: 17}}>
            {Languages.Settings}
          </Text>
        </TouchableOpacity>
      </View>
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
