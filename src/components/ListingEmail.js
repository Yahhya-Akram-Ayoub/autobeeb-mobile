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
class ListingEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isValidEmail: false,
    };
  }

  componentDidMount() {
    this.props.FindStep();
    setTimeout(() => {
      this.setState({done: true}); // this is only to reinitalize the state so the phone input stays green even after leaving the page
      !!this.emailRef && this.emailRef?.focus?.();
      if (this.validateEmail(this.props.email)) {
        this.setState({isValidEmail: true});
      } else {
        this.setState({isValidEmail: false});
      }
    }, 500);
  }

  validateEmail(email) {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
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
                {Languages.EnterEmail}
              </Text>
            )}
            <View
              style={{
                borderColor: '#eee',
                paddingHorizontal: 5,
                marginHorizontal: 20,
              }}>
              <TextInput
                ref={insRef => (this.emailRef = insRef)}
                style={{
                  height: 40,
                  marginTop: 20,
                  paddingVertical: 0,
                  borderRadius: 5,
                  fontFamily: 'Cairo-Regular',
                  backgroundColor: this.state.isValidEmail
                    ? 'rgba(0,255,0,0.2)'
                    : '#fff',
                  borderColor: this.state.isValidEmail ? 'green' : '#eee',
                  borderWidth: 1,
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                  color: '#383737',
                }}
                placeholderTextColor={'#38373770'}
                autoCorrect={false}
                placeholder={Languages.EnterYourEmail}
                onChangeText={text => {
                  this.props.onChangeText(text.trim());
                  if (this.validateEmail(text.trim())) {
                    this.setState({isValidEmail: true});
                  } else {
                    this.setState({isValidEmail: false});
                  }
                }}
                value={this.props.email}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: this.state.isValidEmail
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
                if (this.state.isValidEmail) {
                  if (!this.props.isEditing) {
                    this.props.onDone();
                  } else {
                    this.props.onEditingDone();
                  }
                } else {
                  toast(Languages.InvalidEmail);
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

export default ListingEmail;
