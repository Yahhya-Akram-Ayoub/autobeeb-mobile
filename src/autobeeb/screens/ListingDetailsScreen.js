import {
  Animated,
  BackHandler,
  Easing,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  AddAdvButtonSquare,
  AnimatedContactChatBar,
  AskListingOwner,
  DealerListingsSection,
  FavoriteReportButtons,
  FeatureListingBtn,
  FeaturesModal,
  FeaturesSection,
  HeaderWithShare,
  ListingAutobeebBanner,
  ListingBanner,
  ListingDescription,
  ListingDetailsExtras,
  ListingInfoBox,
  ListingInformation,
  ListingPopupHandler,
  ListingTitle,
  PaymentBox,
  PostYourOfferBanner,
  RelatedListingsSection,
  SellerDetailsSection,
} from '../components';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import KS from '../../services/KSAPI';
import {useDispatch, useSelector} from 'react-redux';
import {Languages} from '../../common';
import {BottomNavigationBar} from '../../components';
import {screenWidth} from '../constants/Layout';
import {actions, recentOpenListings} from '../../redux/RecentListingsRedux';

const ListingDetailsScreen = () => {
  const bottomBarTranslate = useRef(new Animated.Value(0)).current;
  const contactBoxTranslate = useRef(new Animated.Value(100)).current;
  const lastScrollY = useRef(0);
  const currentDirection = useRef(null);
  const route = useRoute();
  const {id, isNewUser, showFeatures, isNeedRefresh} = route.params;
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user ?? state.user.tempUser);
  const {ViewingCurrency, AllowFeature} = useSelector(state => state.menu);
  const dispatch = useDispatch();
  const [listing, setListing] = useState();
  const [loading, setLoading] = useState(true);
  const [refreshFeatures, setRefreshFeatures] = useState(false);
  const [openOTPModal, setOpenOTPModal] = useState(false);

  const handleOpenOTPModal = () => {
    setOpenOTPModal(true);
    setTimeout(() => {
      setOpenOTPModal(false);
    }, 1500);
  };

  const handleReloadFeatures = () => {
    setRefreshFeatures(prev => !prev);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        const state = navigation.getState();
        const currentRouteIndex = state.index;

        if (currentRouteIndex === 0) {
          // Navigate to root of current stack
          navigation.navigate('ActiveOffers');
          return true; // Prevent default back behavior
        } else {
          navigation.goBack();
        }
        return true; // Allow default back behavior
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  useEffect(() => {
    KS.GetListingCore({
      id,
      userId: user?.ID,
      currencyId: ViewingCurrency.ID,
      langId: Languages.langID,
      increaseViews: true,
    })
      .then(res => {
        __DEV__ && console.log({res});
        setListing(res);
        dispatch(recentOpenListings(res));
      })
      .finally(() => {
        setLoading(false);

        if (isNewUser && !showFeatures) handleOpenOTPModal();
      });
  }, []);

  const handleScroll = event => {
    const currentY = event?.nativeEvent?.contentOffset?.y;
    const direction =
      currentY !== 0 && currentY > lastScrollY.current ? 'down' : 'up';

    if (currentY < 100) {
      lastScrollY.current = currentY;
      return;
    }

    if (direction !== currentDirection.current) {
      currentDirection.current = direction;

      Animated.parallel([
        Animated.timing(bottomBarTranslate, {
          toValue: direction === 'down' ? 100 : 0,
          duration: 200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(contactBoxTranslate, {
          toValue: direction === 'down' ? 0 : 100,
          duration: 200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }

    lastScrollY.current = currentY;
  };

  return (
    <View>
      {!loading && listing && (
        <HeaderWithShare
          name={listing?.name}
          listingId={listing?.id}
          typeId={listing?.typeID}
        />
      )}
      <ScrollView showsVerticalScrollIndicator={false} onScroll={handleScroll}>
        <ListingBanner
          loading={loading}
          images={listing?.images}
          isSpecial={listing?.isSpecial}
          imageBasePath={listing?.imageBasePath}
          isNeedRefresh={isNeedRefresh}
          listingId={id}
        />
        <ListingTitle
          loading={loading}
          countryName={listing?.countryName}
          name={listing?.name}
          cityName={listing?.cityName}
          isSpecial={listing?.isSpecial}
          sellType={listing?.sellType}
          formatedPrice={listing?.formatedPrice}
          paymentMethod={listing?.paymentMethod}
          ownerId={listing?.ownerID}
          isPendingDelete={listing?.status === 64 || listing?.status === 1}
          listingId={listing?.id}
          openOTPModal={openOTPModal}
          isNewUser={isNewUser}
        />
        <ListingInfoBox
          loading={loading}
          typeId={listing?.typeID}
          sellType={listing?.sellType}
          year={listing?.year}
          fuelType={listing?.fuelType}
          consumption={listing?.consumption}
          gearBox={listing?.gearbox}
        />
        {AllowFeature && (
          <FeatureListingBtn
            loading={loading}
            listingId={listing?.id}
            isSpecial={listing?.isSpecial}
            secialExpiryDate={listing?.specialExpiryDate}
            ownerId={listing?.ownerID}
            openOTPModale={handleOpenOTPModal}
          />
        )}
        <ListingInformation
          loading={loading}
          sellType={listing?.sellType}
          typeName={listing?.typeName}
          section={listing?.section}
          partNumber={listing?.partNumber}
          categoryName={listing?.categoryName}
          categoryID={listing?.categoryID}
          typeID={listing?.typeID}
          makeName={listing?.makeName}
          modelName={listing?.modelName}
          condition={listing?.condition}
          year={listing?.year}
          rentPeriod={listing?.rentPeriod}
          gearBox={listing?.gearbox}
          fuelType={listing?.fuelType}
          cityName={listing?.cityName}
          consumption={listing?.consumption}
          color={listing?.color}
          colorLabel={listing?.colorLabel}
          id={listing?.id}
          dateAdded={listing?.dateAdded}
          sectionName={listing?.sectionName}
        />
        {!loading && (
          <>
            <FeaturesSection
              listingId={listing?.id}
              refreshFeatures={refreshFeatures}
            />
            <ListingDescription
              loading={loading}
              description={listing?.description}
            />
            <FavoriteReportButtons
              loading={loading}
              listingId={listing?.id}
              isFavorite={listing?.favorite}
              ownerId={listing?.ownerID}
            />
            <AskListingOwner
              loading={loading}
              isSparePart={listing?.isSparePart}
              ownerId={listing?.ownerID}
              isDealer={listing?.isDealer}
              listing={listing}
            />
            <PaymentBox />
            <ListingDetailsExtras
              loading={loading}
              listingId={listing?.id}
              typeId={listing?.typeID}
              name={listing?.isSparePart ? listing?.title : listing?.name}
            />
            <SellerDetailsSection
              listingId={listing?.id}
              loading={loading}
              userId={listing?.ownerID}
            />
            <ListingAutobeebBanner />

            {listing?.isDealer && (
              <DealerListingsSection dealerId={listing?.ownerID} />
            )}

            <RelatedListingsSection listingId={listing?.id} />
            <View style={{height: 110}} />
          </>
        )}
      </ScrollView>

      <Animated.View
        style={[
          styles.CominecationContainer,
          {
            transform: [{translateY: contactBoxTranslate}],
          },
        ]}>
        <AnimatedContactChatBar
          listing={listing}
          ownerId={listing?.ownerID}
          ownerName={listing?.ownerName}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.addOfferSqueerBtn,
          {
            transform: [{translateY: contactBoxTranslate}],
          },
        ]}>
        <AddAdvButtonSquare />
      </Animated.View>

      <Animated.View
        style={[
          styles.navigatBtn,
          {
            transform: [{translateY: bottomBarTranslate}],
          },
        ]}>
        <BottomNavigationBar />
      </Animated.View>

      {!loading && !showFeatures && (
        <ListingPopupHandler
          listingId={listing?.id}
          typeId={listing?.typeID}
          name={listing?.isSparePart ? listing?.title : listing?.name}
          countryId={listing?.countryID}
          ownerId={listing?.ownerID}
          isActive={listing?.status === 16}
        />
      )}
      {showFeatures && (
        <FeaturesModal
          listingId={listing?.id}
          typeId={listing?.typeID}
          sellType={listing?.sellType}
          section={listing?.section}
          isPendingDelete={listing?.status === 64 || listing?.status === 1}
          isNewUser={isNewUser}
          isSpecial={listing?.isSpecial}
          openOTPModale={handleOpenOTPModal}
          reloadFeatures={handleReloadFeatures}
        />
      )}
    </View>
  );
};

export {ListingDetailsScreen};

const styles = StyleSheet.create({
  CominecationContainer: {
    position: 'absolute',
    bottom: 0,
    width: screenWidth,
    zIndex: 2,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
  },
  addOfferSqueerBtn: {
    position: 'absolute',
    right: 0,
    bottom: 60,
    minHeight: 'auto',
    minWidth: 'auto',
    zIndex: 2000,
  },
  navigatBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 2000,
    minHeight: 'auto',
    minWidth: '100%',
  },
});
