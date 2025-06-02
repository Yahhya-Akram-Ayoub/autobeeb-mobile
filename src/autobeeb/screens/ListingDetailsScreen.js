import {Animated, Easing, ScrollView, StyleSheet, View} from 'react-native';
import {
  AddAdvButtonSquare,
  AnimatedContactChatBar,
  AskListingOwner,
  FavoriteReportButtons,
  FeatureListingBtn,
  FeaturesSection,
  HeaderWithShare,
  ListingAutobeebBanner,
  ListingBanner,
  ListingDescription,
  ListingDetailsExtras,
  ListingInfoBox,
  ListingInformation,
  ListingTitle,
  PaymentBox,
  PostYourOfferBanner,
  RelatedListingsSection,
  SellerDetailsSection,
} from '../components';
import {useRoute} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';
import KS from '../../services/KSAPI';
import {useSelector} from 'react-redux';
import {Languages} from '../../common';
import {BottomNavigationBar} from '../../components';
import {screenWidth} from '../constants/Layout';

const ListingDetailsScreen = () => {
  const bottomBarTranslate = useRef(new Animated.Value(0)).current;
  const contactBoxTranslate = useRef(new Animated.Value(100)).current;
  const lastScrollY = useRef(0);
  const currentDirection = useRef(null);

  const route = useRoute();
  const {id} = route.params;
  const user = useSelector(state => state.user.user);
  const ViewingCurrency = useSelector(state => state.menu.ViewingCurrency);
  const [listing, setListing] = useState();
  const [loading, setLoading] = useState(true);
  const [openOTPModal, setOpenOTPModal] = useState(false);

  const handleOpenOTPModal = () => {
    setOpenOTPModal(true);
    setTimeout(() => {
      setOpenOTPModal(false);
    }, 1500);
  };

  useEffect(() => {
    KS.GetListingCore({
      id,
      userId: user?.id,
      currencyId: ViewingCurrency.ID,
      langId: Languages.langID,
      increaseViews: true,
    })
      .then(res => {
        __DEV__ && console.log(res);
        setListing(res);
      })
      .finally(() => {
        setLoading(false);
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
          name={listing?.isSparePart ? listing?.title : listing?.name}
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
        />
        <ListingTitle
          loading={loading}
          countryName={listing?.countryName}
          name={listing?.isSparePart ? listing?.title : listing?.name}
          cityName={listing?.cityName}
          isSpecial={listing?.isSpecial}
          sellType={listing?.sellType}
          formatedPrice={listing?.formatedPrice}
          paymentMethod={listing?.paymentMethod}
          ownerId={listing?.ownerID}
          status={listing?.status}
          listingId={listing?.id}
          openOTPModal={openOTPModal}
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
        <FeatureListingBtn
          loading={loading}
          listingId={listing?.id}
          isSpecial={listing?.isSpecial}
          secialExpiryDate={listing?.specialExpiryDate}
          ownerId={listing?.ownerID}
          openOTPModale={handleOpenOTPModal}
        />
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
        />
        <FeaturesSection listingId={listing?.id} />
        <ListingDescription
          loading={loading}
          description={listing?.description}
        />
        <FavoriteReportButtons
          loading={loading}
          listingId={listing?.id}
          isFavorite={listing?.favorite}
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
          name={listing?.name ?? listing?.title}
        />
        <SellerDetailsSection loading={loading} userId={listing?.ownerID} />
        <ListingAutobeebBanner />
        <RelatedListingsSection
          countryId={listing?.categoryID}
          cityId={listing?.cityID}
        />
        <PostYourOfferBanner />
        <View style={{height: 80}} />
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
