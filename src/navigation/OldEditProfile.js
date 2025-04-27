import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  BackHandler,
  Platform,
} from 'react-native';
import {ButtonIndex} from '../components';
import Awesome from 'react-native-vector-icons/FontAwesome';
import {connect} from 'react-redux';
import {I18nManager} from 'react-native';
import KS from '../services/KSAPI';
import Loading from '../components/loading/Loading';
import Toast, {DURATION} from 'react-native-easy-toast';
import IconMa from 'react-native-vector-icons/MaterialCommunityIcons';

class registerScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //   type: "صيدلية",
      name: this.props.user ? this.props.user.name : '',
      // building: "",
      phone: this.props.user ? this.props.user.phone : '',
      //  mobile: "",
      loading: false,
    };
  }

  static navigationOptions = ({navigation}) => ({
    header: <NewHeader navigation={navigation} back={false} />,
  });

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () =>
      this.props.navigation.goBack(),
    );
  }

  render() {
    const {navigate} = this.props.navigation;

    return (
      <View style={styles.container}>
        <ScrollView scrollEnabled={false} showsVerticalScrollIndicator={false}>
          <Toast
            textStyle={{fontFamily: 'Cairo-Regular', color: 'white'}}
            position="top"
            ref="toast"
            style={{backgroundColor: Color.primary}}
          />

          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: '#ccc',
              paddingVertical: 15,
            }}>
            <IconMa
              name="account-edit"
              color={Color.primary}
              size={40}
              style={{alignSelf: 'center'}}></IconMa>

            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'Cairo-Regular',
                color: Color.primary,
                marginTop: 10,
                fontSize: 22,
              }}>
              {Languages.Information}
            </Text>
          </View>

          <View style={styles.subView}>
            <View style={styles.inputWrap}>
              <Awesome
                name={'user'}
                size={Styles.IconSize.TextInput}
                color={Color.blackTextSecondary}
              />
              <TextInput
                {...commonInputProps}
                ref="name"
                placeholder={Languages.Name}
                onChangeText={name => this.setState({name})}
                onSubmitEditing={this.focusEmail}
                returnKeyType={'next'}
                value={this.state.name}
                style={styles.textField}
              />
            </View>

            <View style={styles.inputWrap}>
              <Awesome
                name={'phone'}
                size={Styles.IconSize.TextInput}
                color={Color.blackTextSecondary}
              />
              <TextInput
                {...commonInputProps}
                ref="phone"
                placeholder={Languages.Phone}
                keyboardType={'phone-pad'}
                onChangeText={phone => this.setState({phone})}
                onSubmitEditing={this.focusPassword}
                returnKeyType={'next'}
                style={styles.textField}
                value={this.state.phone}
              />
            </View>
          </View>
          <View style={styles.buttonCointainer}>
            <ButtonIndex
              onPress={() => {
                this.props.EditUser(this.state.name, this.state.phone);

                KS.UpdateUser({
                  userid: this.props.user.uid,
                  fullname: this.state.name,
                  phone: this.state.phone,
                })
                  .then(response => {
                    if (response.success == 1) {
                      this.refs.toast.show(Languages.savedChanges, 1500);
                    } else {
                    }
                  })
                  .catch(reason => {
                    //  console.warn(reason);
                  });
              }}
              text={Languages.SaveChanges}
              containerStyle={styles.loginButton}
              accessibilityLabel="Learn more about this purple button"
            />
          </View>
        </ScrollView>

        {this.state.loading && <Loading />}
      </View>
    );
  }
}
function showToast(text, time = 3500) {
  let toast = Toast.show(text, {
    duration: time,
    backgroundColor: Color.primary,
    position: Toast.positions.BOTTOM,
    shadow: true,
    shadowColor: '#adb1b2',
    animation: true,
    hideOnPress: true,
    delay: 0,
    onShow: () => {
      // calls on toast\`s appear animation start
    },
    onShown: () => {
      // calls on toast\`s appear animation end.
    },
    onHide: () => {
      // calls on toast\`s hide animation start.
    },
    onHidden: () => {
      // calls on toast\`s hide animation end.
    },
  });

  // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
  setTimeout(function () {
    Toast.hide(toast);
  }, time);
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 15,
    fontFamily: Constants.fontFamily,
    paddingTop: 9,
    paddingHorizontal: 10,
    paddingBottom: 12,
    width: 120,
    //  borderWidth: 1,
    borderColor: 'gray',
    textAlign: 'center',
    //ث  borderRadius: 4,
    //backgroundColor: 'white',
    color: 'black',
  },
  inputAndroid: {
    fontSize: 15,
    fontFamily: Constants.fontFamily,
    paddingTop: 9,
    paddingHorizontal: 10,
    paddingBottom: 12,
    width: 120,

    //  borderWidth: 1,
    //  borderColor: 'gray',
    textAlign: 'center',
    //ث  borderRadius: 4,
    //backgroundColor: 'white',
    color: 'black',
  },
  underline: {},
});
const styles = StyleSheet.create({
  textField: {
    flex: 1,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  subView: {
    marginHorizontal: 35,
  },
  select: {
    height: 60,
  },
  outterView: {
    flexDirection: 'row',
    margin: 5,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputStyle: {
    flex: 9,
  },
  iconStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  logoWrap: {
    ...Styles.Common.ColumnCenter,
    flexGrow: 1,
  },
  logo: {
    width: Styles.width * 0.8,
    height: 90,
    alignSelf: 'center',
    marginTop: 80,
  },
  subContain: {
    paddingHorizontal: Styles.width * 0.1,
    paddingBottom: 50,
  },
  loginForm: {},
  inputWrap: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    borderColor: Color.blackDivide,
    borderBottomWidth: 1,
    marginTop: Platform.OS == 'ios' ? 20 : 0,
  },
  input: {
    borderColor: '#9B9B9B',
    height: 40,
    marginTop: 10,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 8,
    textAlign: 'left',
    flex: 9,
  },
  buttonCointainer: {
    margin: 30,
  },
  myLogin: {
    marginTop: 90,
    backgroundColor: Color.primary,
    borderRadius: 5,
    elevation: 1,
  },
  separatorWrap: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    borderBottomWidth: 1,
    flexGrow: 1,
    borderColor: Color.blackTextDisable,
  },
  separatorText: {
    color: Color.blackTextDisable,
    paddingHorizontal: 10,
    fontFamily: Constants.fontFamily,
  },
  fbButton: {
    backgroundColor: Color.facebook,
    borderRadius: 5,
    elevation: 1,
  },
  // ggButton: {
  //     marginVertical: 10,
  //     backgroundColor: Color.google,
  //     borderRadius: 5,
  // },
  signUp: {
    color: Color.blackTextSecondary,
    marginTop: 20,
  },
  highlight: {
    fontWeight: 'bold',
    color: Color.primary,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: Color.primary,
    borderRadius: 5,
    elevation: 1,
  },
});
const commonInputProps = {
  style: styles.input,
  underlineColorAndroid: 'transparent',
  placeholderTextColor: Color.blackTextSecondary,
  fontFamily: Constants.fontFamily,
};

const mapStateToProps = ({user}) => ({
  user: user.user,
});

const mapDispatchToProps = dispatch => {
  const {actions} = require('../redux/UserRedux');
  return {
    login: user => dispatch(actions.login(user)),
    logout: () => dispatch(actions.logout(dispatch)),
    EditUser: (name, phone) => {
      actions.EditUser(dispatch, name, phone);
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(registerScreen);
