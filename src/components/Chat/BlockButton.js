import {View, Text, Pressable} from 'react-native';
import {Icon, toast} from '../../Omni';
import Languages from '../../common/Languages';
import KS from '../../services/KSAPI';
import {useState} from 'react';

const BlockButton = ({UserId, BlockedId, IsBlocked, onDone}) => {
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
  };
  const BlockUser = () => {
    KS.BlockChatUser({
      UserId,
      BlockedId,
      IsBlocked: !IsBlocked,
    })
      .then(onDone)
      .catch(err => {
        console.log({err});
        alert('error when try to block user');
      })
      .finally(() => {
        setOpen(false);
      });
  };

  return (
    <View
      style={{
        width: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginEnd: 10,
      }}>
      <Pressable
        onPress={() => {
          setOpen(!open);
        }}>
        <Icon name={'dots-vertical'} size={25} color={'#000'} />
      </Pressable>
      {open && (
        <View
          style={{
            position: 'absolute',
            width: 175,
            paddingVertical: 20,
            backgroundColor: '#fff',
            borderColor: '#e6ebf2',
            end: 0,
            top: 35,
            padding: 8,
            borderWidth: 1,
            borderRadius: 3,
          }}>
          <Pressable
            style={{
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            onPress={BlockUser}>
            <Text numberOfLines={1}>
              {!!IsBlocked ? Languages.Unblock : Languages.Block}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default BlockButton;
