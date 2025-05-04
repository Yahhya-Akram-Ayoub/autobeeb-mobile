import {StyleSheet, Text, View} from 'react-native';
import {Color} from '../../common';
import {useMemo} from 'react';

const Message = ({item, index, isOwined}) => {
  const RenderTicks = ({dateRead, reserved}) => {
    const tickElement = useMemo(() => {
      if (dateRead) {
        return <Text style={[styles.CheckIcon, {color: '#fb5201'}]}>✓✓</Text>;
      } else if (reserved) {
        return <Text style={[styles.CheckIcon, {color: '#fff'}]}>✓✓</Text>;
      } else {
        return <Text style={[styles.CheckIcon, {color: '#fff'}]}>✓</Text>;
      }
    }, [dateRead, reserved]);

    return tickElement;
  };

  return (
    <View style={[styles.MainContainer]}>
      <View
        style={[
          styles.Container,
          isOwined ? styles.ContainerSender : styles.ContainerReciver,
        ]}>
        <Text
          style={[
            styles.MessageText,
            isOwined ? styles.TextSender : styles.TextReciver,
          ]}>
          {item.text}
        </Text>
        <View style={styles.DateRow}>
          {isOwined && (
            <RenderTicks dateRead={item.dateRead} reserved={item.reserved} />
          )}
          <Text style={styles.DateText}>{formatToHHMM(item.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
};

const formatToHHMM = isoString => {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // convert 0 to 12

  return `${hours}:${minutes} ${ampm}`;
};

const styles = StyleSheet.create({
  MessageText: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    fontWeight: '400',
    color: '#fff',
    flexShrink: 1,
    flex: 0,
  },
  MainContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  Container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 0,
    width: 'auto',
    maxWidth: '85%',
  },
  ContainerSender: {
    backgroundColor: Color.secondary,
    alignSelf: 'flex-start',
  },
  ContainerReciver: {
    backgroundColor: 'gray',
    alignSelf: 'flex-end',
  },
  CheckIcon: {
    fontSize: 10,
  },
  DateText: {
    color: '#fff',
    fontSize: 12,
  },
  DateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});

export default Message;
