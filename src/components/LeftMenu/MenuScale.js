'use strict';
import {Platform} from 'react-native';
import React, {Component} from 'react';
import Menu from '@custom/react-native-drawer';
import {Constants, Languages} from '../../common';
import {connect} from 'react-redux';
import KS from '../../services/KSAPI';
import {Drawer} from '../../components';
import {EventEmitter} from '../../Omni';
import AsyncStorage from '@react-native-async-storage/async-storage';

class MenuScale extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.sideMenuClick = EventEmitter.addListener(
      Constants.EmitCode.SideMenuOpen,
      this.openSideMenu,
    );

    this.sideMenuClose = EventEmitter.addListener(
      Constants.EmitCode.SideMenuClose,
      this.closeSideMenu,
    );
  }
  Logout() {
    AsyncStorage.setItem('user', '', () => {
      this.props.ReduxLogout();
      //    this.props.navigation.navigate("HomeScreen");
    });
  }

  closeSideMenu = () => this.drawer.close();
  openSideMenu = () => {
    try {
      this.drawer.open();
    } catch (err) {}
  };

  render() {
    return (
      <Menu
        ref={_drawer => (this.drawer = _drawer)}
        type="overlay"
        // captureGestures={false}

        panOpenMask={Platform.select({ios: 0, android: 0.1})}
        tapToClose={true}
        tweenHandler={ratio => {
          return {
            mainOverlay: {opacity: ratio / 1.5, backgroundColor: 'black'},
          };
        }}
        //  panThreshold={0.25}
        openDrawerOffset={0.2}
        onOpenStart={() => {
          if (this.props.user) {
            KS.UserGet({
              userID: this.props.user.ID,
              langid: Languages.langID,
            }).then(data => {
              if (data && data.Success == 1) {
                if (data.User == null) {
                  this.Logout();
                } else
                  this.setState(
                    {
                      userInfoLoaded: true,
                      userLimit:
                        data.User && data.User.IsDealer
                          ? data.User.DealerLimit
                          : data.User.UserLimit,
                      ActiveListings: data.ActiveListings,
                      InActiveListings: data.InActiveListings,
                    },
                    () => {
                      //console.log("active" + data.ActiveListings);
                      // console.log("inactive" + data.InActiveListings);
                    },
                  );
              }
            });

            KS.WatchlistGet({
              langid: Languages.langID,
              userid: this.props.user.ID,
              pagesize: 1000,
              page: 1,
              type: 1,
            }).then(data => {
              if (data && data.Success) {
                this.setState({Favorites: data.Listings});
              }
            });
          }
        }}
        content={
          <Drawer
            navigation={this.props.navigation}
            goToScreen={this.props.goToScreen}
            MenuState={this.state}
            closeDrawer={() => {
              this.drawer.close();
            }}
            // openDrawer={() => {
            //   this.drawer.open();
            // }}
          />
        }>
        {this.props.routes}
      </Menu>
    );
  }
}

const drawerStyles = {
  drawer: {
    shadowColor: '#000000',
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: 'red',
  },
  mainOverlay: {backgroundColor: 'rgba(0,0,0,0.6)'},
  //main: {paddingLeft: 3},
};

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

const mapDispatchToProps = dispatch => {
  const UserRedux = require('../../redux/UserRedux');

  return {
    ReduxLogout: () => dispatch(UserRedux.actions.logout(dispatch)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MenuScale);
