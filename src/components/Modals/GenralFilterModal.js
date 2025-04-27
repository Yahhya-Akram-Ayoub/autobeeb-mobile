import {useEffect, useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {Modal, View, FlatList, Text, TouchableOpacity} from 'react-native';
import {Color, Languages} from '../../common';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

const GeneralFilterModal = ({
  DataList,
  SelectedOptions,
  OnSelect,
  OnClose,
  IsOpen,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([...SelectedOptions]);

  const SelectOption = item => {
    if (item.All) {
      setSelectedOptions([item]);
    } else if (selectedOptions.some(x => x.ID === item.ID)) {
      let options = selectedOptions.filter(x => x.ID != item.ID);
      if (options.length == 0) {
        options.unshift(All);
      }
      setSelectedOptions(options);
    } else {
      let options = selectedOptions.filter(x => x.ID > 0);
      options.push(item);
      setSelectedOptions(options);
    }
  };


  useEffect(() => {
    IsOpen != open && setOpen(!!IsOpen);
    setSelectedOptions([...SelectedOptions]);
  }, [IsOpen, SelectedOptions]);

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
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={DataList}
              style={styles.FlatListOptions}
              renderItem={({item, index}) => {
                return (
                  <Pressable
                    style={styles.OptionButton}
                    onPress={() => {
                      SelectOption(item);
                    }}>
                    <View style={styles.ValueRow}>
                      {item.Color && (
                        <View
                          style={{
                            width: 25,
                            height: 25,
                            borderRadius: 17,
                            backgroundColor: item.Color,
                          }}
                        />
                      )}
                      <Text style={styles.OptionButtonText}>{item.Name}</Text>
                    </View>
                    <IconMC
                      name={
                        selectedOptions.some(x => x.ID === item.ID)
                          ? 'checkbox-marked'
                          : 'checkbox-blank-outline'
                      }
                      color={Color.secondary}
                      size={20}
                    />
                  </Pressable>
                );
              }}
            />
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
                  OnSelect(selectedOptions);
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
    justifyContent: 'center',
    height: '50%',
    width: '100%',
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
});

export default GeneralFilterModal;
