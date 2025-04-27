import React, {Component} from 'react';
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
} from 'react-native';

import {Color} from '../common';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

import Modal from 'react-native-modalbox';
import Languages from '../common/Languages';

export class PickerSelectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Options: this.props.data,
      fullOptions: this.props.data,
      selectedOptions: this.props.SelectedOptions || [],
    };
  }
  open() {
    this.refs.pickerModal.open();
  }
  close() {
    this.refs.pickerModal.close();
  }

  renderOkCancelButton(onCancelPress, onOkPress) {
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
  }

  renderOkButton(onPress) {
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
  }
  render() {
    return (
      <Modal
        ref="pickerModal"
        //  isOpen={true}
        style={[styles.optionModal]}
        position="center"
        backButtonClose={true}
        entry="bottom"
        swipeToClose={false}
        backdropPressToClose={false}
        coverscreen={Platform.OS == 'android'}
        //   isOpen={true}
        backdropOpacity={0.5}>
        <View style={[styles.optionContainer, this.props.ModalStyle || {}]}>
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
                let tempOptions = this.state.fullOptions.filter(item => {
                  return item.Name.toUpperCase().includes(text.toUpperCase());
                });
                this.setState({Options: tempOptions, SearchInput: text});
              }}
              value={this.state.SearchInput}
            />

            <FlatList
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              data={this.state.Options || []}
              //keyboardShouldPersistTaps="handled"
              style={{height: Dimensions.get('screen').height * 0.52}}
              extraData={this.state}
              //contentContainerStyle={{ flexGrow: 1 }}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalRowContainer}
                    onPress={() => {
                      if (this.props.multiSelect) {
                        if (
                          this.state.selectedOptions &&
                          this.state.selectedOptions.filter(
                            option => option.ID == item.ID,
                          ).length > 0 //option is already selected
                        ) {
                          let options = this.state.selectedOptions.filter(
                            option => option.ID != item.ID, //remove option
                          );

                          this.setState({
                            selectedOptions: options,
                          });
                        } else {
                          let options = [];
                          options = this.state.selectedOptions;
                          options.push(item);
                          this.setState({
                            selectedOptions: options,
                          });
                        }
                      } else {
                        //single choice

                        this.setState({
                          selectedOptions: [item],

                          SearchInput: '',
                          Options: this.state.fullOptions,
                        });

                        this.refs.pickerModal.close();
                        this.props.onSelectOption(item);
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
                          this.state.selectedOptions &&
                          this.state.selectedOptions.filter(
                            option => option.ID == item.ID,
                          ).length > 0
                            ? this.props.multiSelect
                              ? 'checkbox-marked'
                              : 'checkbox-marked-circle'
                            : this.props.multiSelect
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

          {this.props.cancelEnabled &&
            this.renderOkCancelButton(
              () => {
                this.setState({
                  selectedOptions: [],
                  SearchInput: '',
                  Options: this.state.fullOptions,
                });
                this.refs.pickerModal.close();
              },
              () => {
                this.setState({
                  SearchInput: '',
                  Options: this.state.fullOptions,
                });
                this.refs.pickerModal.close();
              },
            )}

          {!this.props.cancelEnabled &&
            this.renderOkButton(() => {
              this.setState({
                SearchInput: '',
                Options: this.state.fullOptions,
              });
              if (this.props.onOkPress) {
                this.props.onOkPress(this.state.selectedOptions);
              }
              this.refs.pickerModal.close();
            })}
        </View>
      </Modal>
    );
  }
}
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
