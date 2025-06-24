import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import IconFA from 'react-native-vector-icons/FontAwesome';
import IconFA5 from 'react-native-vector-icons/FontAwesome5';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import Moment from 'moment';
import {Color, Languages} from '../../../common';
import {AppIcon, Icons} from '../shared/AppIcon';
import KS from '../../../services/KSAPI';

const UserOptions = () => {
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const userCountry = useSelector(state => state.user.userCountry);
  const [favorites, setFavorites] = useState([]);
  const [activeListings, setActiveListings] = useState(null);
  const [inactiveListings, setInactiveListings] = useState(null);
  const [userLimit, setUserLimit] = useState(0);
  const [dealerPlusSubscription, setDealerPlusSubscription] = useState(null);
  const [isDealer, setIsDealer] = useState(false);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    if (user?.IsDealer) setIsDealer(true);
    if (!!user) LoadData();
  }, [user]);

  const LoadData = () => {
    // YAHHYA : Need APIs Enhancments
    KS.UserGet({
      userID: user.ID,
      langid: Languages.langID,
    }).then(data => {
      setStatistics(data.Statistic);
      setInactiveListings(data.InActiveListings);
      setActiveListings(data.ActiveListings);
      setUserLimit(
        user?.IsDealer ? data.User.DealerLimit : data.User.UserLimit,
      );
    });

    KS.WatchlistGet({
      langid: Languages.langID,
      userid: user.ID,
      pagesize: 1000,
      page: 1,
      type: 1,
    }).then(data => {
      if (data && data.Success) {
        setFavorites(data.Listings.length);
      }
    });

    KS.GetPlusSubscription({
      userID: user.ID,
      langid: Languages.langID,
    }).then(res => {
      setDealerPlusSubscription(res.DealerPlusSubscription);
    });
  };

  const options = [
    {
      label: Languages.SignInSignUp,
      icon: 'login',
      iconType: Icons.MaterialCommunityIcons,
      onPress: () => navigation.navigate('LoginScreen'),
      isDisplay: !user,
    },
    {
      label: Languages.SignUpAsDealer,
      icon: 'building',
      iconType: Icons.FontAwesome,
      onPress: () => navigation.navigate('DealerSignUp'),
      isDisplay: !user,
    },
    {
      isDisplay: user?.IsDealer && user?.MemberOf && user?.PaidPlans,
      render: () => (
        <View style={styles.subscriptionContainer}>
          <Text style={styles.subscriptionText}>
            {Languages.SubscriptionExpiry} {'\n'}
            {Moment(
              user.MemberOf.find(
                x => x.ID === '33333333-3333-3333-3333-333333333333',
              ).EndDate,
            ).format('YYYY-MM-DD')}
          </Text>
        </View>
      ),
    },
    {
      isLine: true,
      isDisplay: !!user,
    },
    {
      isDisplay: user?.IsDealer && user?.MemberOf && dealerPlusSubscription,
      render: () => (
        <View style={styles.rowsContainer}>
          <View style={styles.dealerPlusHeader}>
            <Text style={styles.subscriptionText}>
              {Languages.SubscDealerPlus}
            </Text>
            <Text style={styles.subscriptionText}>
              {Moment(dealerPlusSubscription?.CreatedAt)
                .add(1, 'M')
                .format('YYYY-MM-DD')}
            </Text>
          </View>
          <Pressable
            style={styles.renewButton}
            onPress={() => {
              navigation.navigate('DealerPlusRenewal', {
                DealerPlusPlanId: dealerPlusSubscription.PlanId,
                userCountry,
              });
            }}>
            <Text style={styles.renewText}>{Languages.Renew}</Text>
          </Pressable>
        </View>
      ),
    },
    {
      label: Languages.PostOffer,
      icon: require('../../../images/PostOfferTrans.png'),
      image: true,
      onPress: () => navigation.navigate('PostOfferScreen'),
      isDisplay: true,
      tag: Languages.FREE,
    },
    {
      isLine: true,
      isDisplay: !!user,
    },
    {
      label: Languages.BecomeADealer,
      icon: 'building',
      iconType: Icons.FontAwesome,
      onPress: () => navigation.navigate('DealerSignUp', {BecomeADealer: true}),
      isDisplay:
        user &&
        !user.IsDealer &&
        user.MemberOf?.every(
          x => x.ID !== '33333333-3333-3333-3333-333333333333',
        ),
    },
    {
      label: Languages.ActiveOffers,
      icon: 'playlist-check',
      iconType: Icons.MaterialCommunityIcons,
      iconSize: 25,
      iconColor: 'green',
      onPress: () =>
        navigation.navigate('ActiveOffers', {
          screen: 'ActiveOffers',
          params: {
            userid: user?.ID,
            status: 16,
            active: true,
          },
        }),
      isDisplay: !!user,
      extraRight:
        userLimit > 0 &&
        activeListings != null &&
        `${activeListings}/${userLimit}`,
    },
    {
      label: Languages.InActiveOffers,
      icon: 'playlist-remove',
      iconType: Icons.MaterialCommunityIcons,
      iconSize: 25,
      iconColor: 'red',
      onPress: () =>
        navigation.navigate('ActiveOffers', {
          screen: 'ActiveOffers',
          params: {
            userid: user?.ID,
            status: 10,
            active: false,
          },
        }),
      isDisplay: !!user,
      extraRight:
        inactiveListings != null &&
        inactiveListings > 0 &&
        `${inactiveListings}`,
    },
    {
      label: Languages.NumberViewsMyAds,
      icon: 'eye',
      iconType: Icons.FontAwesome5,
      iconSize: 18,
      onPress: null,
      isDisplay: isDealer,
      extraRight: (statistics?.ViewsClicks ?? 0) + (statistics?.ScViews ?? 0),
    },
    {
      label: Languages.MyFavourites,
      icon: 'heart',
      iconType: Icons.FontAwesome,
      iconColor: Color.primary,
      onPress: () => navigation.navigate('FavoriteScreen'),
      isDisplay: !!user,
      extraRight: favorites > 0 ? `${favorites}` : null,
    },
    {
      isLine: true,
      isDisplay: !!user,
    },
  ];

  return (
    <View>
      {options
        .filter(option => option.isDisplay)
        .map((option, index) => {
          if (option.render) return <View key={index}>{option.render()}</View>;
          if (option.isLine)
            return <View key={index} style={styles.rowsContainer} />;

          return (
            <TouchableOpacity
              key={index}
              style={styles.rowStyle}
              onPress={option.onPress}>
              <View style={styles.iconContainer}>
                {option.image ? (
                  <Image
                    source={option.icon}
                    style={styles.iconImage}
                    resizeMode="contain"
                  />
                ) : (
                  <AppIcon
                    type={option.iconType}
                    name={option.icon}
                    size={option.iconSize || 20}
                    color={option.iconColor || Color.secondary}
                  />
                )}
              </View>
              <View style={styles.textRowContainer}>
                <Text style={styles.label}>{option.label}</Text>
                {!!option.tag && <Text style={styles.tag}>{option.tag}</Text>}
                {!!option.extraRight && (
                  <Text style={styles.extra}>{option.extraRight}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
    </View>
  );
};

export default UserOptions;

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
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    tintColor: Color.secondary,
    width: 25,
    height: 25,
  },
  textRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  label: {
    color: '#000',
    fontSize: 17,
  },
  tag: {
    borderRadius: 15,
    overflow: 'hidden',
    color: '#fff',
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: Color.primary,
  },
  extra: {
    textAlign: 'center',
    color: Color.primary,
    fontSize: 20,
  },
  subscriptionContainer: {
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
    height: 65,
    justifyContent: 'center',
  },
  subscriptionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ff0000',
  },
  dealerPlusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  renewButton: {
    alignSelf: 'flex-end',
    marginEnd: 16,
  },
  renewText: {
    fontSize: 16,
    color: Color.secondary,
  },
});
