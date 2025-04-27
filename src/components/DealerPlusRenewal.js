import {ActivityIndicator, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import {Styles, Color, Constants, Languages} from '../common';
import {useSelector} from 'react-redux';

const DealerPlusRenewal = ({route}) => {
  const _user = useSelector(state => state.user.user);
  const userCountry = route.params?.userCountry;
  const dealerPlusPlanId = route.params?.DealerPlusPlanId;
  const navigation = useNavigation();

  return (
    <View style={{width: '100%', height: '100%'}}>
      <WebView
        thirdPartyCookiesEnabled={true}
        originWhitelist={['*']}
        mixedContentMode={'always'}
        domStorageEnabled={true}
        allowUniversalAccessFromFileURLs={true}
        javaScriptEnabled={true}
        style={{flex: 1}}
        onMessage={event => {
          let _data = event.nativeEvent.data;
          console.log({_data});
          if (!!_data) {
            let data = JSON.parse(_data);
            if (!!data && data?.Screen == 'CliQScreen') {
              navigation.navigate(data.Screen, {
                Price: data.Price,
                PlanName: data.Name,
              });
            } else {
              navigation.navigate('HomeScreen');
            }
          } else {
            navigation.navigate('HomeScreen');
            k;
          }
        }}
        source={{
          uri: `${'https://autobeeb.com'}/${
            Languages.prefix
          }/payment/service-fee?PlanId=${dealerPlusPlanId}&CountryId=${
            userCountry?.ID
          }&UserId=${_user.ID}&cur=2`,
        }}
        renderLoading={() => (
          <ActivityIndicator
            color={Color.primary}
            size="large"
            style={{
              alignSelf: 'center',
              position: 'absolute',
              zIndex: 99,
              top: '50%',
            }}
          />
        )}
        startInLoadingState={true}
      />
    </View>
  );
};

export {DealerPlusRenewal};
