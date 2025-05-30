import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  I18nManager,
  Pressable,
  FlatList,
} from 'react-native';
import {Color, Constants, Languages} from '../common';
import {SpecialSVG} from '.';
import IconFa from 'react-native-vector-icons/FontAwesome';
import FastImage from 'react-native-fast-image';
import KS from '../services/KSAPI';

const screen = Dimensions.get('screen');
const windowWidth = Dimensions.get('window').width;

const FeatueredListingCard = ({
  item: rawItem,
  navigation,
  AppCountryCode,
  AllCountries,
  SelectedCities,
  fullScreen,
  isListingsScreen,
  isSpecialOnly,
  isFavorites,
  user,
  removeFavorite,
}) => {
  const [favorite, setFavorite] = useState(true);
  const item = rawItem?.item?.m_Item2 || rawItem;

  const differentCountry = isDifferentCountry(
    item,
    AppCountryCode,
    AllCountries,
    SelectedCities,
  );
  const imageList = getImageList(item, isSpecialOnly);
  const imageWidth = getImageWidth(item, fullScreen);
  const sellTypeInfo = getSellTypeInfo(
    Constants.sellTypes,
    item.SellType,
    item.TypeName,
    item.ThumbURL,
  );
  const logoSource = getLogoSource(item, AppCountryCode, AllCountries);

  const onFavoritePress = () => {
    KS.WatchlistAdd({
      listingID: item.ID,
      userid: user.ID,
      type: 1,
    }).then(data => {
      if (data?.Success) {
        setFavorite(data.Favorite);
        if (!data.Favorite) {
          removeFavorite?.(item.ID);
        }
      }
    });
  };

  const cardStyles = [
    styles.cardBase,
    isListingsScreen && styles.cardListing,
    differentCountry && styles.cardDifferentCountry,
    isSpecialOnly && styles.cardSpecialOnly,
    isSpecialOnly && {width: windowWidth * (fullScreen ? 0.96 : 0.84)},
  ];

  return (
    <View key={item.ID} style={cardStyles}>
      <View style={styles.imageContainer}>
        {item.ThumbURL ? (
          <FlatList
            contentContainerStyle={styles.imageList}
            data={imageList}
            horizontal={!isSpecialOnly}
            scrollEnabled={!isSpecialOnly || true}
            nestedScrollEnabled={true}
            renderItem={({item: img, index}) => (
              <Pressable
                key={index}
                style={[item.Images?.length === 1 ? styles.singleImage : {}]}
                onPress={() =>
                  navigation.push('CarDetails', {item, id: item.ID})
                }>
                <FastImage
                  style={[styles.image, {width: imageWidth}]}
                  source={{
                    uri: `https://autobeeb.com/${item.ImageBasePath}${img}_750x420.jpg`,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
                {index === 0 && !!item.SellType && (
                  <Text
                    style={[
                      styles.sellTypeText,
                      {backgroundColor: sellTypeInfo.backgroundColor},
                    ]}>
                    {sellTypeInfo.label}
                  </Text>
                )}
                {item.Images?.length > 0 && (
                  <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>
                      {item.Images.length}
                    </Text>
                    <IconFa name="image" size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            )}
          />
        ) : (
          <Pressable
            style={styles.singleImage}
            onPress={() => navigation.push('CarDetails', {item, id: item.ID})}>
            <FastImage
              style={styles.placeholderImage}
              source={require('../images/placeholder.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.infoContainer}>
        {isFavorites && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}>
            <IconFa
              name={favorite ? 'heart' : 'heart-o'}
              size={20}
              color={favorite ? Color.primary : 'black'}
            />
          </TouchableOpacity>
        )}

        <View style={[styles.details, isSpecialOnly && {bottom: 6}]}>
          <View style={styles.priceRow}>
            {!isSpecialOnly && !!item.FormatedPrice && (
              <Text style={styles.price}>
                {item.FormatedPrice || Languages.CallForPrice}
              </Text>
            )}
            {!isSpecialOnly && item.PaymentMethod === 2 && (
              <Text style={styles.installments}>
                {(!!item.FormatedPrice ? '/' : ' ') + Languages.Installments}
              </Text>
            )}
          </View>

          <View style={styles.nameRow}>
            <FastImage
              style={styles.logoImage}
              resizeMode={FastImage.resizeMode.contain}
              source={logoSource}
            />
            <Text numberOfLines={1} style={styles.title}>
              {item.Name}
            </Text>
            <SpecialSVG />
          </View>
        </View>
      </View>
    </View>
  );
};

const getImageList = (item, isSpecialOnly) =>
  isSpecialOnly ? [item.Images?.[0]] : item.Images;

const getImageWidth = (item, fullScreen) =>
  item.Images?.length === 1 ? '100%' : windowWidth - 75;

const isDifferentCountry = (
  item,
  AppCountryCode,
  AllCountries,
  SelectedCities,
) =>
  (AppCountryCode !== 'ALL' &&
    (AllCountries || item.ISOCode !== AppCountryCode)) ||
  (SelectedCities &&
    SelectedCities[0]?.ID !== '' &&
    !SelectedCities.find(x => x.ID === item.CityID));

const getSellTypeInfo = (sellTypes, sellTypeId, typeName, thumbURL) => {
  const type = sellTypes.find(st => st.ID === sellTypeId);
  const name = type?.Name || '';
  const backgroundColor = type?.backgroundColor || '#000';

  return {
    label: thumbURL ? name : `${typeName} ${name}`,
    backgroundColor,
  };
};

const getLogoSource = (item, AppCountryCode, AllCountries) => {
  if (AllCountries || item.ISOCode !== AppCountryCode) {
    return {uri: `https://autobeeb.com/wsImages/flags/${item.ISOCode}.png`};
  }

  if (item.TitleFullImagePath) {
    return {uri: `https://autobeeb.com/${item.TitleFullImagePath}_300x150.png`};
  }

  if (item.TypeID === 16) {
    return {
      uri: `https://autobeeb.com/content/newlistingcategories/16${item.CategoryID}/${item.CategoryID}_300x150.png`,
    };
  }

  return {
    uri: `https://autobeeb.com/content/newlistingmakes/${item.MakeID}/${item.MakeID}_240x180.png`,
  };
};

const styles = StyleSheet.create({
  cardBase: {
    borderColor: '#f00707',
    borderWidth: 2,
    shadowColor: '#f00707',
    shadowOffset: {width: 0, height: 9},
    shadowOpacity: 0.48,
    shadowRadius: 11.95,
    elevation: 18,
    backgroundColor: '#fff',
    paddingTop: 8,
    marginBottom: 10,
    borderRadius: 10,
    marginHorizontal: 8,
    paddingBottom: 15,
  },
  cardListing: {
    height: screen.height * 0.36,
  },
  cardDifferentCountry: {
    borderWidth: 2,
    borderColor: Color.primary,
    overflow: 'hidden',
    width: windowWidth * 0.96,
    alignSelf: 'center',
    borderRadius: 5,
  },
  cardSpecialOnly: {
    minHeight: screen.height * 0.32,
    gap: 10,
    paddingBottom: 2,
  },
  imageContainer: {
    marginHorizontal: 8,
  },
  imageList: {
    alignSelf: 'flex-start',
    minWidth: '100%',
    gap: 15,
  },
  singleImage: {
    minWidth: '100%',
  },
  image: {
    height: windowWidth / 1.77,
    borderRadius: 10,
  },
  placeholderImage: {
    width: '100%',
    height: windowWidth / 1.77,
    borderRadius: 10,
  },
  sellTypeText: {
    color: '#fff',
    padding: 3,
    minWidth: 45,
    textAlign: 'center',
    position: 'absolute',
    zIndex: 2,
    left: 0,
    top: 0,
    borderTopRightRadius: 10,
  },
  imageCounter: {
    position: 'absolute',
    backgroundColor: '#122',
    bottom: 10,
    left: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 5,
  },
  infoContainer: {
    paddingHorizontal: 8,
    marginTop: 6,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: '#fbfbfb',
    elevation: 3,
    top: 5,
    right: 5,
  },
  details: {
    width: screen.width,
    bottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
  },
  installments: {
    color: '#000',
    fontSize: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 30,
    height: 30,
    marginRight: 3,
  },
  title: {
    fontSize: 16,
    color: '#000',
    maxWidth: screen.width * 0.85,
  },
});

export default FeatueredListingCard;
