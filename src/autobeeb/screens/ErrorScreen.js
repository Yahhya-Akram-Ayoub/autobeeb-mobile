import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {actions} from '../../redux/HomeRedux';
import {useNavigation} from '@react-navigation/native';
import {Color, Languages} from '../../common';
import {AppHeader} from '../components';
import {useState} from 'react';

const ErrorScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  const {ViewingCountry, ViewingCurrency} = useSelector(state => state.menu);
  const navigation = useNavigation();
  const [isLoging, setIsLoading] = useState(false);

  const refreshScreen = () => {
    setIsLoading(true);
    actions.HomeScreenGet(
      dispatch,
      Languages.langID,
      ViewingCountry?.cca2,
      5,
      ViewingCurrency.ID,
      data => {
        if (data) navigation.goBack();
        setIsLoading(false);
      },
      user?.ID,
    );

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <AppHeader onCountryChange={refreshScreen} />
      <View style={styles.content}>
        <Image
          style={styles.image}
          resizeMode="cover"
          source={require('../../images/errorpage.png')}
        />
        <Text style={styles.errorText}>{Languages.SomethingWentWrong}</Text>
        <TouchableOpacity style={styles.tryAgainButton} onPress={refreshScreen}>
          {isLoging ? (
            <ActivityIndicator color={'#fff'} size={'large'} />
          ) : (
            <Text style={styles.tryAgainText}>{Languages.TryAgain}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: Dimensions.get('screen').width * 0.4,
    aspectRatio: 0.85114503816,
    height: Dimensions.get('screen').width * 0.8,
  },
  errorText: {
    fontSize: 30,
    fontFamily: 'Cairo-Bold',
    color: 'red',
  },
  tryAgainButton: {
    marginTop: 20,
    minWidth: 200,
    backgroundColor: Color.primary,
    borderRadius: 10,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tryAgainText: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
  },
});

export {ErrorScreen};
