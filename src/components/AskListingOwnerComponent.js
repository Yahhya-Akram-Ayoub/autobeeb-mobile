import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Touchable,
  Dimensions,
} from 'react-native';
import {Languages, Color} from '../common';
import KS from '../services/KSAPI';
import {toast} from '../Omni';
import {TouchableOpacity} from 'react-native-gesture-handler';

const AskListingOwner = ({
  navigateToLogin,
  Listing,
  OwnerId,
  UserId,
  IsDealer,
}) => {
  const sendMessage = messaeg => {
    if (!!UserId) {
      KS.AddEntitySession({
        userID: UserId,
        targetID: OwnerId,
        relatedEntity: JSON.stringify({...Listing, IsDealer}),
      }).then(result2 => {
        KS.SendMessage({
          senderID: UserId,
          receiverID: OwnerId,
          message: messaeg,
          sessionID: result2.SessionID,
        }).then(res => {
          console.log({res});
        });
        toast(Languages.MessageSent);
      });
    } else {
      navigateToLogin();
    }
  };

  if (OwnerId == UserId) return <></>;

  return (
    <View
      style={[
        styles.AskBox,
        styles.BoxShadow,
        {backgroundColor: '#fff', paddingTop: 12},
        styles.marginBottom,
      ]}>
      <Text style={[styles.AskListingOwner, styles.titleStyle]}>
        {Languages.AskListingOwner}
      </Text>
      <View style={[styles.Qbox]}>
        {[
          Languages.interested_how_much,
          Languages.final_price,
          Languages.condition,
          Languages.location,
        ].map(item => (
          <TouchableOpacity onPress={() => sendMessage(item)}>
            <Text style={styles.QuestionPoup}>{item}</Text>
          </TouchableOpacity>
        ))}
        {Listing.TypeID == 32 &&
          [
            Languages.new_or_used,
            Languages.manufacture,
            Languages.warranty,
            Languages.delivery,
          ].map(item => (
            <TouchableOpacity onPress={() => sendMessage(item)}>
              <Text style={styles.QuestionPoup}>{item}</Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: 2,
  },
  titleStyle: {
    fontSize: 18,
    fontWeight: '700',
  },
  BoxShadow: {
    shadowColor: Color.secondary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
    width: Dimensions.get('screen').width - 10,
    alignSelf: 'center',
    marginHorizontal: 'auto',
  },
  QuestionPoup: {
    borderRadius: 5,
    width: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#207ea5',
    color: '#fff',
  },
  Qbox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  AskBox: {},
  AskListingOwner: {
    color: 'black',
    fontSize: 18,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
});

export default AskListingOwner;
