import {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {Color, Constants, Languages} from '../../../common';
import {AppIcon, Icons} from '../shared/AppIcon';
import KS from '../../../services/KSAPI';
import {screenWidth} from '../../constants/Layout';

const FavoriteReportButtons = ({loading, listingId, isFavorite}) => {
  const user = useSelector(state => state.user.user);
  const navigation = useNavigation();
  const [favorite, setFavorite] = useState();

  useEffect(() => {
    setFavorite(isFavorite);
  }, [isFavorite]);

  const handleAddToFavorites = () => {
    if (user) {
      KS.WatchlistAdd({
        listingID: listingId,
        userid: user.ID,
        type: 1,
      }).then(data => {
        if (data?.Success) {
          setFavorite(data.Favorite);
        }
      });
    } else {
      navigation.navigate('LoginScreen');
    }
  };

  const handleReport = () => {
    if (user) {
      navigation.navigate('ListingReportScreen', {listingId});
    } else {
      Alert.alert('', Languages.YouNeedToLoginFirst, [
        {
          text: Languages.Ok,
          onPress: () => navigation.navigate('LoginScreen'),
        },
        {text: Languages.Cancel},
      ]);
    }
  };
  if (loading) return <></>;
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.buttonBox} onPress={handleAddToFavorites}>
        <AppIcon
          type={Icons.Ionicons}
          name={favorite ? 'heart' : 'heart-outline'}
          size={25}
          color={Color.primary}
        />
        <Text style={styles.buttonText}>{Languages.AddToFavourites}</Text>
      </TouchableOpacity>
      <View style={{width: 10}} />
      <TouchableOpacity style={styles.buttonBox} onPress={handleReport}>
        <AppIcon type={Icons.Octicons} name="alert" size={20} color="#e44e44" />
        <Text style={styles.buttonText}>{Languages.Report}</Text>
      </TouchableOpacity>
    </View>
  );
};

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
    flexDirection: 'row',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-between',
  },
  buttonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Color.secondary,
    borderRadius: 5,
    padding: 8,
    shadowColor: Color.secondary,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  buttonText: {
    color: Color.blackTextSecondary,
    fontSize: 14,
    fontFamily: Constants.fontFamilyBold,
  },
});

export default FavoriteReportButtons;
