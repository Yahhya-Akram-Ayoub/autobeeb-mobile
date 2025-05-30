import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import Moment from 'moment';
import {Color, Constants, Languages} from '../../../common';
import {SkeletonLoader} from '../shared/Skeleton';
import {arrayOfNull} from '../shared/StaticData';
import {screenWidth} from '../../constants/Layout';

const _arr = arrayOfNull(10);
const ListingInformation = ({
  loading,
  sellType,
  typeName,
  section,
  partNumber,
  categoryName,
  categoryID,
  typeID,
  makeName,
  modelName,
  condition,
  year,
  rentPeriod,
  gearBox,
  fuelType,
  cityName,
  consumption,
  color,
  colorLabel,
  id,
  dateAdded,
}) => {
  const renderFuelType = value => {
    return Constants.FilterFuelTypes.find(FT => FT.ID === value)?.Name ?? '';
  };
  const renderGearBox = value => {
    return Constants.FilterFuelTypes.find(FT => FT.ID === value)?.Name ?? '';
  };
  const renderSection = listing => {
    try {
      const {TypeID, SectionName} = listing;
      const words = SectionName?.split(' ') || [];

      if (TypeID === 4 && Languages.langID !== 2) {
        return words[0];
      }

      if (TypeID === 32 && words.length > 2) {
        return Languages.langID === 2 ? words[2] : words[0];
      }

      return SectionName;
    } catch {
      return listing?.SectionName ?? '';
    }
  };

  if (loading)
    return (
      <View style={[styles.boxContainerSkeleton]}>
        {_arr.map(x => (
          <SkeletonLoader
            containerStyle={[styles.skeletonRow]}
            borderRadius={3}
            shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
            animationDuration={1200}
          />
        ))}
      </View>
    );

  return (
    <View style={[styles.boxContainer]}>
      <Text style={[styles.blackHeader]}>{Languages.Information}</Text>

      {!!sellType && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.SellType}</Text>
          <View style={styles.row}>
            <Text style={styles.sectionValue}>{typeName + ' '}</Text>
            <Text
              style={[
                styles.sectionValue,
                {
                  fontWeight: '600',
                  color: Constants.sellTypes.find(val => val.ID === sellType)
                    ?.backgroundColor,
                },
              ]}>
              {Constants.sellTypes.find(val => val.ID === sellType)?.Name}
            </Text>
          </View>
        </View>
      )}

      {!!section && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.Section}</Text>
          <Text numberOfLines={1} style={styles.sectionValue}>
            {renderSection()}
          </Text>
        </View>
      )}

      {!!partNumber && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.PartNumber}</Text>
          <Text numberOfLines={1} style={styles.sectionValue}>
            {partNumber}
          </Text>
        </View>
      )}

      {!!categoryName && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.Category}</Text>
          <View style={styles.spaceBetween}>
            <Text numberOfLines={1} style={styles.sectionValue}>
              {categoryName}
            </Text>
            <Image
              style={styles.categoryImage}
              source={{
                uri: `https://autobeeb.com/content/newlistingcategories/${typeID}${categoryID}/${categoryID}_50x50.jpg`,
              }}
            />
          </View>
        </View>
      )}

      {!!makeName && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.Make}</Text>
          <Text numberOfLines={1} style={styles.sectionValue}>
            {makeName}
          </Text>
        </View>
      )}

      {!!modelName && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.Model}</Text>
          <Text numberOfLines={1} style={styles.sectionValue}>
            {modelName}
          </Text>
        </View>
      )}

      {!!condition && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.Status}</Text>
          <Text style={styles.sectionValue}>
            {
              Constants.FilterOfferCondition.find(val => val.ID === condition)
                ?.Name
            }
          </Text>
        </View>
      )}

      {!!year && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.Year}</Text>
          <Text style={styles.sectionValue}>{year}</Text>
        </View>
      )}

      {!!rentPeriod && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.RentPeriod}</Text>
          <Text style={styles.sectionValue}>
            {
              Constants.FilterRentPeriod.find(val => val.ID === rentPeriod)
                ?.Name
            }
          </Text>
        </View>
      )}

      {!!gearBox && (
        <View style={styles.sectionHalf}>
          <Text numberOfLines={1} style={styles.sectionTitle}>
            {Languages.GearBox}
          </Text>
          <Text style={styles.sectionValue}>{renderGearBox(gearBox)}</Text>
        </View>
      )}

      {!!fuelType && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.FuelType}</Text>
          <Text style={styles.sectionValue}>{renderFuelType(fuelType)}</Text>
        </View>
      )}

      {!!cityName && cityName !== 'null' && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.City}</Text>
          <Text numberOfLines={1} style={styles.sectionValue}>
            {cityName}
          </Text>
        </View>
      )}

      {!!consumption && (
        <View style={styles.sectionHalf}>
          <Text numberOfLines={1} style={styles.sectionTitle}>
            {typeID === 4 ? Languages.WorkingHours : Languages.Mileage}
          </Text>
          <Text style={styles.sectionValue}>
            {typeID === 4 ? `${consumption}${Languages.Hrs}` : consumption}
          </Text>
        </View>
      )}

      {!!colorLabel && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.Color}</Text>
          <View style={styles.row}>
            <View style={[styles.colorDot, {backgroundColor: color}]} />
            <Text style={styles.sectionValue}> {colorLabel}</Text>
          </View>
        </View>
      )}

      {!!id && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.OfferID}</Text>
          <Text style={styles.sectionValue}>{id}</Text>
        </View>
      )}

      {!!dateAdded && (
        <View style={styles.sectionHalf}>
          <Text style={styles.sectionTitle}>{Languages.PublishedDate}</Text>
          <Text style={styles.sectionValue}>
            {Moment(dateAdded).format('YYYY-MM-DD')}
          </Text>
        </View>
      )}
      {/* added to fix styles */}
      <View style={{flex: 1}} />
    </View>
  );
};

const styles = StyleSheet.create({
  boxContainer: {
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
    flexWrap: 'wrap',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-around',
    marginTop: 6,
  },
  boxContainerSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#fff',
    width: screenWidth - 14,
    alignSelf: 'center',
  },
  skeletonRow: {height: 30, width: '45%', marginBottom: 10},
  boxShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
  },
  marginBottom: {
    marginBottom: 15,
  },
  blackHeader: {
    paddingHorizontal: 10,
    width: '100%',
    paddingTop: 4,
    paddingBottom: 3,
    color: '#000',
    fontSize: 18,
    marginBottom: 5,
    fontFamily: Constants.fontFamilyBold,
  },

  sectionHalf: {
    width: screenWidth / 2 - 26,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#eeeeee80',
  },
  sectionTitle: {
    fontSize: 15,
    textAlign: 'left',
    color: '#000',
    fontFamily: Constants.fontFamilyBold,
  },
  sectionValue: {
    fontSize: 13,
    textAlign: 'left',
    color: '#283B77',
    fontFamily: Constants.fontFamilyBold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryImage: {
    width: 40,
    height: 40,
  },
  colorDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    elevation: 2,
  },
});

export default ListingInformation;
