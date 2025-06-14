import {Text, TouchableOpacity, Linking, StyleSheet} from 'react-native';
import IconFa from 'react-native-vector-icons/FontAwesome5';
import IconIon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import KS from '../../../services/KSAPI';
import {Color, Languages} from '../../../common';
import {useSelector} from 'react-redux';

const AnimatedContactChatBar = ({listing, ownerId, ownerName}) => {
  const user = useSelector(state => state.user.user ?? state.user.tempUser);
  const navigation = useNavigation();
  const isOnline = false; // handle later

  const handleChatPress = async () => {
    if (user) {
      delete listing.views;
      const data = await KS.AddEntitySession({
        userID: user.ID,
        targetID: ownerId,
        relatedEntity: JSON.stringify(listing),
      });

      navigation.navigate('ChatScreen', {
        targetID: ownerId,
        ownerName: ownerName,
        description: listing?.isSparePart ? listing?.title : listing?.name,
        entityID: listing.id,
        sessionID: data.SessionID,
      });
    } else {
      navigation.navigate('LoginScreen');
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${listing.phone}`);
    KS.UpdateMobileClick({
      UserId: listing.ownerID,
      ListingId: listing.id,
    });
  };

  const shouldShowChat = !user || user.ID !== ownerId;

  return (
    <>
      <TouchableOpacity
        onPress={handleCall}
        style={[styles.bottomBox, styles.phoneBtn]}>
        <IconFa name="phone" size={20} color={Color.secondary} />
        <Text
          style={{
            color: Color.secondary,
            fontSize: 16,
            marginHorizontal: 4,
          }}>
          {Languages.Call}
        </Text>
      </TouchableOpacity>

      {shouldShowChat && (
        <TouchableOpacity
          onPress={handleChatPress}
          style={[
            styles.bottomBox,
            styles.chatBtn,
            isOnline && {backgroundColor: 'green'},
          ]}>
          {isOnline ? (
            <IconIon name="chatbubbles" size={20} color="#fff" />
          ) : (
            <IconIon name="chatbubbles-outline" size={20} color="green" />
          )}
          <Text
            style={{
              color: isOnline ? '#fff' : 'green',
              fontSize: 16,
              marginHorizontal: 4,
            }}>
            {isOnline ? Languages.Online : Languages.Chat}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default AnimatedContactChatBar;

const styles = StyleSheet.create({
  bottomBox: {
    flexDirection: 'row',
    borderRightColor: '#fff',
    borderRightWidth: 1,
    flex: 1,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2B9531',
    borderRadius: 5,
  },
  phoneBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Color.secondary,
    borderRadius: 5,
  },
});
