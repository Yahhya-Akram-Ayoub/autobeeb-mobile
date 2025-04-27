import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {CardLinkPreview} from '..';
import {Languages} from '../../common';

const WantedMessage = ({currentMessage, navigation}) => {
  let offer = JSON.parse(currentMessage.extraInfo);
  const _prefix = Languages.prefix;

  const getPreviewOfferUrl = (Id, Type, Section) => {
    return `https://autobeeb.com/${_prefix}/offer-preview/${Id}/${Type}`;
  };

  let linkPreview = getPreviewOfferUrl(
    !!offer?.OfferId ? offer?.OfferId : offer?.ID,
    !!offer?.OfferTypeId ? offer?.OfferTypeId : offer?.TypeID,
    !!offer?.OfferSectionId ? offer?.OfferSectionId : offer?.Section,
  );
  let ownerName = offer?.OwnerName ?? '';

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.push('CarDetails', {
          item: offer,
        });
      }}>
      <View style={styles.wantedText}>
        <Text style={styles.messageText}>{Languages.NewWanted}</Text>
        <Text style={styles.messageText}>
          {Languages.WantedText.replaceAll('{0}', ownerName)}
        </Text>
      </View>
      <CardLinkPreview url={linkPreview} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wantedText: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  messageText: {
    fontSize: 18,
    fontWeight: 700,
  },
});

export default WantedMessage;
