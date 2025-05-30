import {ScrollView, View} from 'react-native';
import {
  AskListingOwner,
  FavoriteReportButtons,
  FeatureListingBtn,
  FeaturesSection,
  ListingBanner,
  ListingDescription,
  ListingInfoBox,
  ListingInformation,
  ListingTitle,
} from '../components';
import {useRoute} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import KS from '../../services/KSAPI';
import {useSelector} from 'react-redux';
import {Languages} from '../../common';

const ListingDetailsScreen = () => {
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

  return (
    <ScrollView>
      <ListingBanner
        loading={loading}
        images={listing?.images}
        isSpecial={listing?.isSpecial}
        imageBasePath={listing?.imageBasePath}
      />
      <ListingTitle
        loading={loading}
        countryName={listing?.countryName}
        name={listing?.name ?? listing?.title}
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
    </ScrollView>
  );
};

export {ListingDetailsScreen};
