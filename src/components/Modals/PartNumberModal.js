import {useEffect, useState} from 'react';
import {Pressable, StyleSheet, TextInput} from 'react-native';
import {Modal, View, FlatList, Text, TouchableOpacity} from 'react-native';
import {Color, Languages} from '../../common';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {I18nManager} from 'react-native';

const PartNumberModal = ({PartNumber, OnEnter, OnClose, IsOpen}) => {
  const [open, setOpen] = useState(false);
  const [partNumber, setPartNumber] = useState(PartNumber);

  useEffect(() => {
    IsOpen != open && setOpen(!!IsOpen);
    setPartNumber(PartNumber);
  }, [IsOpen, PartNumber]);

  const setOpenFc = flag => {
    setOpen(flag);
    OnClose(flag);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={open}
      onRequestClose={() => {
        setOpenFc(false);
      }}
      backButtonClose={true}
      entry="bottom"
      backdropPressToClose
      swipeToClose={false}>
      <View style={styles.ModalView}>
        <View style={styles.ModalDataView}>
          {
            <View style={styles.InputContainer}>
              <Text style={styles.Title}>{Languages.PartNumber}</Text>
              <TextInput
                style={styles.PartNumberInput}
                placeholder={Languages.EnterPartNumber}
                onChangeText={text => {
                  setPartNumber(text);
                }}
                value={partNumber}
              />
            </View>
          }
          {
            <View style={styles.BtnsBox}>
              <TouchableOpacity
                style={styles.CancelBtn}
                onPress={() => {
                  setOpenFc(false);
                }}>
                <Text style={styles.CancelBtnText}>{Languages.CANCEL}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.OkayBtn}
                onPress={() => {
                  OnEnter(partNumber);
                  setOpenFc(false);
                }}>
                <Text style={styles.OkayBtnText}>{Languages.OK}</Text>
              </TouchableOpacity>
            </View>
          }
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  FlatListOptions: {
    padding: 10,
    flex: 1,
  },
  OptionButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomColor: Color.secondary,
    borderBottomWidth: 1,
    height: 50,
  },
  OptionButtonText: {
    color: '#000',
    fontSize: 16,
  },
  ModalView: {
    alignSelf: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '90%',
  },
  ModalDataView: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    justifyContent: 'space-evenly',
    height: 'auto',
    width: '100%',
    paddingVertical: 20,
    gap: 20,
  },
  CancelBtn: {
    flex: 1,
    backgroundColor: '#fff',
  },
  CancelBtnText: {
    color: Color.secondary,
    textAlign: 'center',
    paddingVertical: 14,
    fontFamily: 'Cairo-Bold',
    fontSize: 15,
  },
  BtnsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  OkayBtn: {
    flex: 1,
    backgroundColor: Color.secondary,
    borderRadius: 5,
  },
  OkayBtnText: {
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 15,
  },
  ValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
  },
  PartNumberInput: {
    width: '90%',
    height: 45,
    fontFamily: 'Cairo-Regular',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 3,
  },
  Title: {
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 18,
    color: Color.blackTextSecondary,
  },
  InputContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 20,
    color: Color.blackTextSecondary,
  },
});

export default PartNumberModal;
