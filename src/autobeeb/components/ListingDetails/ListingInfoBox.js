import {View, Text, Image, StyleSheet} from 'react-native';
import {Constants, Languages} from '../../../common';
import {SkeletonLoader} from '../shared/Skeleton';

const ListingInfoBox = ({
  loading,
  typeId,
  sellType,
  year,
  fuelType,
  consumption,
  gearBox,
}) => {
  const renderFuelType = value => {
    return Constants.FilterFuelTypes.find(FT => FT.ID === value)?.Name ?? '';
  };
  const renderGearBox = value => {
    return Constants.FilterFuelTypes.find(FT => FT.ID === value)?.Name ?? '';
  };

  if (loading)
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'space-around',
            paddingVertical: 50,
            marginBottom: 8,
          },
        ]}>
        {[1, 2, 3, 4].map(x => (
          <SkeletonLoader
            key={`${x}`}
            containerStyle={[styles.skeletonBox]}
            borderRadius={3}
            shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
            animationDuration={1200}
          />
        ))}
      </View>
    );
  if (![1, 2, 4, 8].includes(typeId) || sellType !== 1) {
    return <></>;
  }
  return (
    <View style={styles.container}>
      {!!year && (
        <View style={styles.box}>
          <Image
            style={styles.icon}
            resizeMode="contain"
            source={require('../../../images/year.png')}
          />
          <Text style={styles.text}>{year}</Text>
        </View>
      )}
      {!!fuelType && (
        <View style={styles.box}>
          <Image
            style={styles.icon}
            resizeMode="contain"
            source={require('../../../images/fuelType.png')}
          />
          <Text style={styles.text}>{renderFuelType(fuelType)}</Text>
        </View>
      )}
      {!!consumption && (
        <View style={styles.box}>
          <Image
            style={styles.icon}
            resizeMode="contain"
            source={require('../../../images/km.png')}
          />
          <Text style={styles.text}>
            {typeId === 4
              ? `${consumption}${Languages.Hrs}`
              : `${consumption}${Languages.KM}`}
          </Text>
        </View>
      )}
      {!!gearBox && (
        <View style={[styles.box, styles.lastBox]}>
          <Image
            style={styles.icon}
            resizeMode="contain"
            source={require('../../../images/gearbox.png')}
          />
          <Text style={styles.text}>{renderGearBox(gearBox)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    shadowColor: '#eee',
    shadowOffset: {width: 0, height: 7},
    shadowOpacity: 0.41,
    shadowRadius: 9.11,
    elevation: 14,
    minHeight: 68,
  },
  box: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  lastBox: {
    borderRightWidth: 0,
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
  },
  skeletonBox: {
    height: 62,
    width: '20%',
  },
});

export default ListingInfoBox;
