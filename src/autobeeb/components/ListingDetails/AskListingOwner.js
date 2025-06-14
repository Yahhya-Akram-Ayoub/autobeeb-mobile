import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import KS from '../../../services/KSAPI';
import {Color, Constants, Languages} from '../../../common';
import {toast} from '../../../Omni';
import {screenWidth} from '../../constants/Layout';

const AskListingOwner = ({
  loading,
  isSparePart,
  ownerId,
  isDealer,
  listing,
}) => {
  const user = useSelector(state => state.user.user ?? state.user.tempUser);
  const navigation = useNavigation();

  const sendMessage = messaeg => {
    if (user) {
      KS.AddEntitySession({
        userID: user.ID,
        targetID: ownerId,
        relatedEntity: JSON.stringify({...listing, IsDealer: isDealer}),
      }).then(result2 => {
        KS.SendMessage({
          senderID: user.ID,
          receiverID: ownerId,
          message: messaeg,
          sessionID: result2.SessionID,
        }).then(res => {});
        toast(Languages.MessageSent);
      });
    } else {
      navigation.navigate('LoginScreen');
    }
  };

  if (loading) return <></>;
  if (ownerId === user?.ID) return <></>;

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.blackHeader}>{Languages.AskListingOwner}</Text>
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
        {isSparePart &&
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
  cardContainer: {
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
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-around',
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
    fontSize: 15,
    fontFamily: Constants.fontFamily,
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
