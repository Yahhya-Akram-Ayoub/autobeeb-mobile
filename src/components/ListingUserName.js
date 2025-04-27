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
class ListingUserName extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.FindStep();
    setTimeout(() => {
      this.setState({done: true}); // this is only to reinitalize the state so the phone input stays green even after leaving the page
      this.refs.username && this.refs.username.focus();
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
            {false && (
              <Text style={{textAlign: 'center', paddingBottom: 15}}>
                {Languages.EnterYourName}
              </Text>
            )}
            <View
              style={{
                borderColor: '#eee',
                paddingHorizontal: 5,
                marginHorizontal: 20,
              }}>
              <TextInput
                ref="username"
                style={{
                  height: 40,
                  marginTop: 20,
                  borderRadius: 5,
                  paddingVertical: 0,
                  fontFamily: 'Cairo-Regular',
                  backgroundColor:
                    this.props.userName &&
                    this.props.userName.length > 2 &&
                    this.props.userName.length < 26
                      ? 'rgba(0,255,0,0.2)'
                      : '#fff',
                  borderColor:
                    this.props.userName &&
                    this.props.userName.length > 2 &&
                    this.props.userName.length < 26
                      ? 'green'
                      : '#eee',
                  borderWidth: 1,
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                  color: '#383737',
                }}
                placeholderTextColor={'#38373770'}
                autoCorrect={false}
                placeholder={Languages.EnterYourName}
                maxLength={26}
                onChangeText={this.props.onChangeText}
                value={this.props.userName}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor:
                  this.props.userName &&
                  this.props.userName.length > 2 &&
                  this.props.userName.length < 26
                    ? 'green'
                    : Color.secondary,
                alignSelf: 'center',
                width: Dimensions.get('screen').width * 0.4,
                paddingVertical: 10,
                borderRadius: 25,
                elevation: 2,
                marginTop: 20,
              }}
              onPress={() => {
                if (
                  this.props.userName &&
                  this.props.userName.length > 2 &&
                  this.props.userName.length < 27
                ) {
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

export default ListingUserName;
