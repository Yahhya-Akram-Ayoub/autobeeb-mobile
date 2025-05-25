import {View, Text, StyleSheet} from 'react-native';
import {Languages} from '../../../common';
import SpecialSVG from './SpecialSVG';

const SpecialOfferBadge = () => {
  const isDefaultLang = Languages.prefix === 'en' || Languages.prefix === 'ar';

  if (isDefaultLang) {
    return (
      <View style={styles.specialSignal}>
        <Text style={styles.specialSignalText}>{Languages.SpecialOffer}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.specialSignal, styles.specialSignalOtherLang]}>
      <Text
        style={[styles.specialSignalText, styles.specialSignalTextOtherLang]}>
        <SpecialSVG />
        <View style={styles.svgSpacer} />
        <SpecialSVG />
        <View style={styles.svgSpacer} />
        <SpecialSVG />
      </Text>
    </View>
  );
};

export default SpecialOfferBadge;

const styles = StyleSheet.create({
  specialSignal: {
    position: 'absolute',
    top: 10,
    zIndex: 10,
    backgroundColor: '#FF0000',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    left: 10,
  },
  specialSignalText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  specialSignalOtherLang: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  specialSignalTextOtherLang: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  svgSpacer: {
    width: 5,
  },
});
