import {View, Text, StyleSheet, I18nManager} from 'react-native';
import {Color, Constants, Languages} from '../../../common';
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
  svgSpacer: {
    width: 5,
  },
  specialSignal: {
    top: 40,
    right: -60,
    position: 'absolute',
    transform: I18nManager.isRTL ? [{rotate: '315deg'}] : [{rotate: '45deg'}],
    textTransform: 'uppercase',
    paddingVertical: 2,
    paddingHorizontal: 0,
    zIndex: 1,
    width: 250,
    backgroundColor: '#ff1c1a',
    letterSpacing: 0.5,
    backgroundImage: 'radial-gradient(circle, #ff1c1a, #bf0b00)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 2, height: 1},
    textShadowRadius: 0,
  },
  specialSignalText: {
    color: '#e9ea7b',
    fontSize: 15,
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#e5e82c',
    paddingVertical: 2,
    fontFamily: Constants.fontFamilyBold,
  },
  specialSignalTextOtherLang: {
    borderColor: '#ff1c1a',
    gap: 15,
    flexDirection: 'row',
  },
  specialSignalOtherLang: {
    backgroundColor: '#e5e82c',
  },
  SpecialShadow: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 5,
    borderColor: Color.primary,
  },
});
