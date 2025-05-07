import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  TextInput,
  I18nManager,
  Platform,
  Modal,
} from 'react-native';
import {Color} from '../common';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import Languages from '../common/Languages';
import AutobeebModal from './Modals/AutobeebModal';

const PickerSelectModal = forwardRef((props, ref) => {
  const {
    data,
    SelectedOptions,
    onOkPress,
    cancelEnabled,
    onSelectOption,
    multiSelect,
    ModalStyle,
  } = props;
  const ModalRef = useRef(null);
  const [options, setOptions] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [fullOptions, setFullOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(SelectedOptions || []);

  useEffect(() => {
    if (!options?.length) {
      setOptions(data);
    }
    setFullOptions(data);
  }, [data]);

  useImperativeHandle(ref, () => ({
    open: () => ModalRef.current?.open(),
    close: () => ModalRef.current?.close(),
  }));

  const RenderOkCancelButton = (onCancelPress, onOkPress) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          //  borderTopColor: "#ccc",
          //  borderTopWidth: 1,
          //  padding: 8,
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,

          justifyContent: 'center',
          //    backgroundColor: "#ff0"
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#fff',
          }}
          onPress={() => {
            onCancelPress();
          }}>
          <Text
            style={{
              color: Color.secondary,
              textAlign: 'center',
              paddingVertical: 14,
              fontFamily: 'Cairo-Bold',
              fontSize: 15,
            }}>
            {Languages.CANCEL}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: Color.secondary,
            borderRadius: 5,
          }}
          onPress={() => {
            onOkPress();
          }}>
          <Text
            style={{
              color: '#fff',
              textAlign: 'center',
              paddingVertical: 10,
              fontSize: 15,
            }}>
            {Languages.OK}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const RenderOkButton = ({onPress}) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderTopColor: '#ccc',
          borderTopWidth: 1,

          justifyContent: 'center',
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
          backgroundColor: '#fff',
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: Color.secondary,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
          }}
          onPress={() => {
            onPress();
          }}>
          <Text
            style={{
              color: '#fff',
              textAlign: 'center',
              paddingVertical: 14,
              fontSize: 15,
            }}>
            {Languages.OK}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AutobeebModal
      ref={ModalRef}
      style={[styles.optionModal]}
      position="center"
      keyboardResponsive={true}
      entry="bottom"
      swipeToClose={false}
      backdropPressToClose={false}
      coverscreen={Platform.OS == 'android'}
      //   isOpen={true}
      backdropOpacity={0.5}>
      <View style={[styles.optionContainer, ModalStyle || {}]}>
        <View style={{}}>
          <TextInput
            style={{
              height: 40,
              fontFamily: 'Cairo-Regular',

              borderColor: Color.secondary,
              borderBottomWidth: 1,
              paddingHorizontal: 15,
              textAlign: I18nManager.isRTL ? 'right' : 'left',
            }}
            placeholder={Languages.Search}
            onChangeText={text => {
              let tempOptions = fullOptions.filter(item => {
                return item.Name.toUpperCase().includes(text.toUpperCase());
              });
              setOptions(tempOptions);
              setSearchInput(text);
            }}
            value={searchInput}
          />

          <FlatList
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            data={options || []}
            style={{height: Dimensions.get('screen').height * 0.52}}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.modalRowContainer}
                  onPress={() => {
                    if (multiSelect) {
                      if (
                        !!selectedOptions &&
                        selectedOptions.filter(option => option.ID == item.ID)
                          .length > 0 //option is already selected
                      ) {
                        let options = selectedOptions.filter(
                          option => option.ID != item.ID, //remove option
                        );

                        setSelectedOptions(options);
                      } else {
                        let options = [];
                        options = selectedOptions;
                        options.push(item);
                        setSelectedOptions(options);
                      }
                    } else {
                      setSelectedOptions([item]);
                      setSearchInput('');
                      setOptions(fullOptions);
                      ModalRef.current?.close();
                      !!onSelectOption && onSelectOption(item);
                    }
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{color: 'black', fontSize: 15}}>
                      {item.Name}
                    </Text>
                    <IconMC
                      name={
                        !!selectedOptions &&
                        selectedOptions.filter(option => option.ID == item.ID)
                          .length > 0
                          ? multiSelect
                            ? 'checkbox-marked'
                            : 'checkbox-marked-circle'
                          : multiSelect
                          ? 'checkbox-blank-outline'
                          : 'checkbox-blank-circle-outline'
                      }
                      color={Color.secondary}
                      size={20}
                    />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {cancelEnabled && (
          <RenderOkCancelButton
            onCancelPress={() => {
              setSelectedOptions([]);
              setSearchInput('');
              setOptions(fullOptions);
              ModalRef.current?.close();
            }}
            onOkPress={() => {
              setSearchInput('');
              setOptions(fullOptions);
              ModalRef.current?.close();
            }}
          />
        )}

        {!cancelEnabled && (
          <RenderOkButton
            onPress={() => {
              setSearchInput('');
              setOptions(fullOptions);
              !!onOkPress && onOkPress(this.state.selectedOptions);
              ModalRef.current?.close();
            }}
          />
        )}
      </View>
    </AutobeebModal>
  );
});

const styles = StyleSheet.create({
  optionModal: {
    zIndex: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: Dimensions.get('screen').height,
    width: Dimensions.get('screen').width,
    padding: 0,
    //  flex: 1,

    elevation: 10,
  },

  optionContainer: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    alignSelf: 'center',
    marginBottom: 80,
    //   height: Dimensions.get("screen").height * 0.7,

    width: Dimensions.get('screen').width * 0.85,
  },

  modalRowContainer: {
    marginVertical: 3,
    paddingBottom: 5,
    height: 50,
    justifyContent: 'center',
    //       borderWidth:1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default PickerSelectModal;
