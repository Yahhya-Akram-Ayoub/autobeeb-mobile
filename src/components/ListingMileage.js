import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  Platform,
  I18nManager,
  KeyboardAvoidingView,
} from 'react-native';
import {Color, Images, Styles, Constants, Languages, Icons} from '../common';
import {toast} from '../Omni';
class ListingMileage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.mileageRef = React.createRef();
  }

  componentDidMount() {
    this.props.FindStep();

    setTimeout(() => {
      this.setState({done: true}); // this is only to reinitalize the state so the phone input stays green even after leaving the page
      this.mileageRef?.focus();
    }, 500);
  }

  render() {
    return (
      <ScrollView
        style={{flex: 1, backgroundColor: 'white'}}
        contentContainerStyle={{justifyContent: 'center', flexGrow: 1}}
        keyboardShouldPersistTaps={Platform.select({
          ios: 'handled',
          android: 'always',
        })}>
        <KeyboardAvoidingView
          keyboardVerticalOffset={Platform.select({ios: 200, android: 100})}
          behavior={Platform.select({android: 'padding', ios: 'padding'})}>
          <View style={{}}>
            <View
              style={{
                borderColor: '#eee',
                paddingHorizontal: 5,
                marginHorizontal: 20,
              }}>
              <TextInput
                ref={this.mileageRef}
                style={{
                  fontFamily: 'Cairo-Regular',
                  height: 40,
                  backgroundColor: '#fff',
                  borderColor: '#eee',
                  paddingVertical: 0,
                  borderRadius: 5,
                  marginTop: 20,
                  borderWidth: 1,
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                  color: '#383737',
                }}
                placeholderTextColor={'#38373770'}
                keyboardType="numeric"
                maxLength={7}
                placeholder={
                  this.props.currentStep == 15 &&
                  this.props.sellType == 1 &&
                  this.props.listingType == 4
                    ? Languages.EnterWorkingHours
                    : Languages.EnterMileage
                }
                onChangeText={this.props.onChangeText}
                value={this.props.mileage}
              />
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: Color.secondary,
                alignSelf: 'center',
                width: Dimensions.get('screen').width * 0.4,
                paddingVertical: 10,
                borderRadius: 25,
                elevation: 2,
                marginTop: 20,
              }}
              onPress={() => {
                if (this.props.mileage && this.props.mileage.length < 8) {
                  if (!this.props.isEditing) {
                    this.props.onDone();
                  } else {
                    this.props.onEditingDone();
                  }
                } else {
                  toast(Languages.invalidInfo);
                }
              }}>
              <Text style={{color: '#fff', textAlign: 'center'}}>
                {Languages.Next}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}

export default ListingMileage;
